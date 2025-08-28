import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card';
import { StatisticsData, PopularCategory } from '@/app/hooks/useStatistics';

interface StatisticsDetailsProps {
  stats: StatisticsData;
  popularCategories: PopularCategory[];
  renderSafeAmount: (amount: number) => string;
  calculatePercentage: (a: number, b: number) => number;
}

export const StatisticsDetails = ({ 
  stats, 
  popularCategories, 
  renderSafeAmount, 
  calculatePercentage 
}: StatisticsDetailsProps) => {
  return (
    <>
      {/* การ์ดแสดงข้อมูลการชำระเงิน */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">สถานะการชำระเงิน</CardTitle>
            <CardDescription className="text-xs sm:text-sm">ข้อมูลการชำระเงินของบิลทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex justify-around py-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.settledBills}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">ชำระแล้ว</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pendingBills}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">รอชำระ</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{calculatePercentage(stats.settledBills, stats.totalBills)}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">อัตราการชำระ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">บิลที่มีมูลค่าสูงสุด</CardTitle>
            <CardDescription className="text-xs sm:text-sm">รายละเอียดบิลที่มีมูลค่าสูงที่สุด</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-base sm:text-lg mb-3 truncate">
                {stats.mostExpensiveBill.title || 'ไม่มีข้อมูล'}
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">วันที่</span>
                <span className="text-xs sm:text-sm">
                  {stats.mostExpensiveBill.date.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">ยอดรวม</span>
                <span className="font-bold text-lg sm:text-xl">
                  {renderSafeAmount(stats.mostExpensiveBill.amount)} บาท
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* หมวดหมู่ยอดนิยม */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>หมวดหมู่ยอดนิยม</CardTitle>
            <CardDescription>หมวดหมู่ค่าใช้จ่ายที่ใช้บ่อยที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            {popularCategories && popularCategories.length > 0 ? (
              <ul className="space-y-2">
                {popularCategories.map(category => (
                  <li key={category.id} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.name}</span>
                    {category.count && (
                      <span className="ml-auto text-muted-foreground">{category.count} บิล</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">ไม่มีหมวดหมู่ยอดนิยม</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 