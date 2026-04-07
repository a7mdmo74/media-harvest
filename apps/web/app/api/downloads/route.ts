import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { downloadStats, downloadMetrics } from '@/db/schema';
// import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { version, platform, source } = await request.json();
    
    // Get client info
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const country = request.headers.get('x-country') || 'unknown';
    
    // TODO: Record to database when set up
    // await db.insert(downloadStats).values({
    //   version,
    //   platform,
    //   source,
    //   ipAddress,
    //   userAgent,
    //   country,
    //   downloadedAt: new Date(),
    // });
    
    // TODO: Update daily metrics when database is set up
    // For now, just return success
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download tracking error:', error);
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month, year
    
    // Mock data for 300 downloads - remove this when database is set up
    const mockTotals = {
      totalDownloads: 300,
      windowsDownloads: 210,
      macDownloads: 60,
      linuxDownloads: 30,
      githubDownloads: 180,
      websiteDownloads: 120,
    };
    
    // Generate mock daily data
    const mockDailyData = [];
    const today = new Date();
    let days = 7;
    
    if (period === 'day') days = 1;
    if (period === 'week') days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate growing trend
      const baseDownloads = Math.floor(Math.random() * 10) + 5;
      const growthFactor = (days - i) / days; // More recent = more downloads
      const dailyDownloads = Math.floor(baseDownloads * (1 + growthFactor));
      
      mockDailyData.push({
        date: dateStr,
        totalDownloads: dailyDownloads,
        windowsDownloads: Math.floor(dailyDownloads * 0.7),
        macDownloads: Math.floor(dailyDownloads * 0.2),
        linuxDownloads: dailyDownloads - Math.floor(dailyDownloads * 0.7) - Math.floor(dailyDownloads * 0.2),
        githubDownloads: Math.floor(dailyDownloads * 0.6),
        websiteDownloads: dailyDownloads - Math.floor(dailyDownloads * 0.6),
      });
    }
    
    // Calculate totals from daily data
    const calculatedTotals = mockDailyData.reduce(
      (acc, day) => ({
        totalDownloads: acc.totalDownloads + day.totalDownloads,
        windowsDownloads: acc.windowsDownloads + day.windowsDownloads,
        macDownloads: acc.macDownloads + day.macDownloads,
        linuxDownloads: acc.linuxDownloads + day.linuxDownloads,
        githubDownloads: acc.githubDownloads + day.githubDownloads,
        websiteDownloads: acc.websiteDownloads + day.websiteDownloads,
      }),
      {
        totalDownloads: 0,
        windowsDownloads: 0,
        macDownloads: 0,
        linuxDownloads: 0,
        githubDownloads: 0,
        websiteDownloads: 0,
      }
    );
    
    return NextResponse.json({
      period,
      totals: mockTotals, // Use exact 300 total
      dailyData: mockDailyData,
    });
  } catch (error) {
    console.error('Download metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
