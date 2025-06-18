import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

/**
 * API endpoint สำหรับรับ Error Reports
 * POST /api/errors
 */
export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json();

    // Validate required fields
    if (!errorReport.message || !errorReport.fingerprint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Rate limiting สามารถเพิ่มได้ในอนาคต
    // ใช้ fingerprint สำหรับ deduplication
    
    // เพิ่มข้อมูลเพิ่มเติม
    const enrichedErrorReport = {
      ...errorReport,
      serverTimestamp: new Date().toISOString(),
      userIP: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      environment: process.env.NODE_ENV,
      appVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
    };

    // บันทึกลง Firestore (ใน production จริงอาจใช้ dedicated logging service)
    if (db) {
      try {
        await addDoc(collection(db, 'error_reports'), enrichedErrorReport);
      } catch (firestoreError) {
        // ถ้า Firestore fail ให้ log ไว้แต่ไม่ให้ API fail
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to save to Firestore:', firestoreError);
        }
      }
    }

    // ส่งไปยัง External Services (ถ้ามี)
    try {
      await sendToExternalServices(enrichedErrorReport);
    } catch (externalError) {
      // Silent fail for external services
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send to external services:', externalError);
      }
    }

    // สำหรับ Critical Errors ส่ง alert ทันที
    if (errorReport.level === 'critical') {
      try {
        await sendCriticalAlert(enrichedErrorReport);
      } catch (alertError) {
        // Silent fail for alerts
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        errorId: errorReport.id,
        message: 'Error report received successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    // ไม่ให้ Error API ล่มเพราะอาจทำให้ระบบหลักได้รับผลกระทบ
    if (process.env.NODE_ENV === 'development') {
      console.error('Error API failed:', error);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * ส่งไปยัง External Services
 */
async function sendToExternalServices(errorReport: any): Promise<void> {
  const promises: Promise<any>[] = [];

  // ส่งไป Webhook (เช่น Slack, Discord, Teams)
  if (process.env.ERROR_WEBHOOK_URL) {
    promises.push(
      fetch(process.env.ERROR_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 Error Report: ${errorReport.message}`,
          attachments: [{
            color: getLevelColor(errorReport.level),
            fields: [
              {
                title: 'Error Details',
                value: `**Level:** ${errorReport.level}\n**Component:** ${errorReport.context?.component}\n**Page:** ${errorReport.context?.page}\n**Count:** ${errorReport.count}`,
                short: false,
              },
              {
                title: 'Context',
                value: `**User:** ${errorReport.context?.userId || 'Anonymous'}\n**Session:** ${errorReport.context?.sessionId}\n**Build:** ${errorReport.appVersion}`,
                short: true,
              },
            ],
            footer: 'BuddyPay Error Monitoring',
            ts: Math.floor(Date.now() / 1000),
          }],
        }),
      })
    );
  }

  // ส่งไป Third-party Error Tracking (เช่น Sentry)
  if (process.env.SENTRY_DSN) {
    // ตัวอย่าง integration กับ Sentry
    promises.push(
      fetch('https://sentry.io/api/errors/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: errorReport.message,
          level: errorReport.level,
          tags: {
            component: errorReport.context?.component,
            page: errorReport.context?.page,
            environment: process.env.NODE_ENV,
          },
          extra: errorReport.context,
        }),
      })
    );
  }

  // รอให้ทุก promises เสร็จ (แต่ไม่ block ถ้ามี error)
  await Promise.allSettled(promises);
}

/**
 * ส่ง Critical Alert
 */
async function sendCriticalAlert(errorReport: any): Promise<void> {
  const promises: Promise<any>[] = [];

  // ส่ง SMS/Email alert สำหรับ Critical Errors
  if (process.env.CRITICAL_ALERT_WEBHOOK) {
    promises.push(
      fetch(process.env.CRITICAL_ALERT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'critical_error',
          title: '🔴 CRITICAL ERROR ALERT',
          message: errorReport.message,
          details: {
            component: errorReport.context?.component,
            page: errorReport.context?.page,
            userId: errorReport.context?.userId,
            timestamp: errorReport.serverTimestamp,
            errorId: errorReport.id,
          },
          actions: [
            {
              text: 'View Error Dashboard',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/errors?filter=${errorReport.fingerprint}`,
            },
          ],
        }),
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * ดึงสีตาม Error Level
 */
function getLevelColor(level: string): string {
  switch (level) {
    case 'critical': return '#ff0000';
    case 'high': return '#ff6600';
    case 'medium': return '#ffcc00';
    case 'low': return '#33cc33';
    default: return '#666666';
  }
}

/**
 * GET endpoint สำหรับดึงข้อมูล error statistics (สำหรับ admin)
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authorization (ควรมี admin check)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ในการใช้งานจริง ควรตรวจสอบ JWT token และ admin role
    
    // ดึงข้อมูลจาก Firestore
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    // ส่ง basic stats (ในการใช้งานจริงควรมี pagination และ filtering)
    const stats = {
      message: 'Error statistics endpoint',
      note: 'Implementation depends on your specific needs and database structure',
    };

    return NextResponse.json(stats);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 