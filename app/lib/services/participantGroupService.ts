import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Participant } from '../schema';
import { ParticipantGroup, ParticipantGroupWithoutId } from '../types/participantGroup';

// คอลเลคชัน Firestore
const COLLECTION_NAME = 'participantGroups';

// บันทึกกลุ่มผู้เข้าร่วมใหม่
export async function saveParticipantGroup(
  userId: string,
  name: string,
  participants: Participant[],
  description?: string
): Promise<string> {
  try {
    // สร้างข้อมูลกลุ่มใหม่โดยไม่รวม description ก่อน
    const groupData: Omit<ParticipantGroupWithoutId, 'description'> = {
      name,
      participants,
      userId,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    // เพิ่ม description เมื่อมีค่าและไม่ใช่ค่าว่าง
    if (description !== undefined && description !== '') {
      (groupData as ParticipantGroupWithoutId).description = description;
    }
    
    // บันทึกลง Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), groupData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving participant group:', error);
    throw new Error('ไม่สามารถบันทึกกลุ่มได้');
  }
}

// ดึงข้อมูลกลุ่มทั้งหมดของผู้ใช้
export async function getParticipantGroups(userId: string): Promise<ParticipantGroup[]> {
  try {
    const groupsRef = collection(db, COLLECTION_NAME);
    const q = query(groupsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const groups: ParticipantGroup[] = [];
    snapshot.forEach(doc => {
      groups.push({ id: doc.id, ...doc.data() } as ParticipantGroup);
    });
    
    // เรียงตามวันที่สร้างล่าสุด
    return groups.sort((a, b) => 
      b.createdAt.toMillis() - a.createdAt.toMillis()
    );
  } catch (error) {
    console.error('Error fetching participant groups:', error);
    throw new Error('ไม่สามารถดึงข้อมูลกลุ่มได้');
  }
}

// ลบกลุ่มผู้เข้าร่วม
export async function deleteParticipantGroup(groupId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, groupId));
  } catch (error) {
    console.error('Error deleting participant group:', error);
    throw new Error('ไม่สามารถลบกลุ่มได้');
  }
} 