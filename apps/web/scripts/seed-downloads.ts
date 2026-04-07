import { db } from '../db';
import { downloadStats, downloadMetrics } from '../db/schema';

async function seedDownloads() {
  try {
    console.log('🌱 Seeding download analytics...');
    
    // Clear existing data
    await db.delete(downloadStats);
    await db.delete(downloadMetrics);
    
    // Generate realistic download data over the past 30 days
    const today = new Date();
    const totalDownloads = 300;
    
    // Distribute downloads across platforms (70% Windows, 20% Mac, 10% Linux)
    const platformDistribution = {
      windows: Math.floor(totalDownloads * 0.7), // 210
      mac: Math.floor(totalDownloads * 0.2),     // 60
      linux: Math.floor(totalDownloads * 0.1),    // 30
    };
    
    // Distribute downloads across sources (60% GitHub, 40% Website)
    const sourceDistribution = {
      github: Math.floor(totalDownloads * 0.6), // 180
      website: Math.floor(totalDownloads * 0.4), // 120
    };
    
    // Generate individual download records
    const downloadRecords = [];
    let currentTotal = 0;
    
    // Create daily metrics for past 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate realistic daily download pattern (more recent = more downloads)
      const dailyMultiplier = 1 - (i * 0.02); // Older days have fewer downloads
      const dailyDownloads = Math.max(1, Math.floor(Math.random() * 15 * dailyMultiplier));
      
      // Generate platform breakdown for this day
      const dailyWindows = Math.floor(dailyDownloads * 0.7);
      const dailyMac = Math.floor(dailyDownloads * 0.2);
      const dailyLinux = dailyDownloads - dailyWindows - dailyMac;
      
      // Generate source breakdown for this day
      const dailyGithub = Math.floor(dailyDownloads * 0.6);
      const dailyWebsite = dailyDownloads - dailyGithub;
      
      // Insert daily metrics
      await db.insert(downloadMetrics).values({
        date: dateStr,
        totalDownloads: dailyDownloads,
        windowsDownloads: dailyWindows,
        macDownloads: dailyMac,
        linuxDownloads: dailyLinux,
        githubDownloads: dailyGithub,
        websiteDownloads: dailyWebsite,
        updatedAt: new Date(),
      });
      
      // Generate individual download records for this day
      for (let j = 0; j < dailyDownloads; j++) {
        const platform = j < dailyWindows ? 'windows' : j < dailyWindows + dailyMac ? 'mac' : 'linux';
        const source = j < dailyGithub ? 'github' : 'website';
        
        downloadRecords.push({
          version: '1.0.1',
          platform,
          source,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Media Harvest Desktop/1.0.1',
          country: ['US', 'UK', 'CA', 'DE', 'FR', 'AU', 'JP', 'BR', 'IN', 'MX'][Math.floor(Math.random() * 10)],
          downloadedAt: new Date(date.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
        });
      }
      
      currentTotal += dailyDownloads;
    }
    
    // Insert individual download records in batches
    console.log(`📊 Inserting ${downloadRecords.length} download records...`);
    
    // Insert in batches of 50 to avoid overwhelming the database
    for (let i = 0; i < downloadRecords.length; i += 50) {
      const batch = downloadRecords.slice(i, i + 50);
      await db.insert(downloadStats).values(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / 50) + 1}/${Math.ceil(downloadRecords.length / 50)}`);
    }
    
    // Get final totals
    const finalMetrics = await db
      .select()
      .from(downloadMetrics)
      .orderBy(downloadMetrics.date);
    
    const grandTotal = finalMetrics.reduce((sum, day) => sum + day.totalDownloads, 0);
    
    console.log('\n🎉 Download analytics seeded successfully!');
    console.log(`📈 Total Downloads: ${grandTotal}`);
    console.log(`🖥️  Windows: ${finalMetrics.reduce((sum, day) => sum + day.windowsDownloads, 0)}`);
    console.log(`🍎  macOS: ${finalMetrics.reduce((sum, day) => sum + day.macDownloads, 0)}`);
    console.log(`🐧 Linux: ${finalMetrics.reduce((sum, day) => sum + day.linuxDownloads, 0)}`);
    console.log(`📁 GitHub: ${finalMetrics.reduce((sum, day) => sum + day.githubDownloads, 0)}`);
    console.log(`🌐 Website: ${finalMetrics.reduce((sum, day) => sum + day.websiteDownloads, 0)}`);
    console.log(`📅 Days tracked: ${finalMetrics.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding downloads:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDownloads().then(() => {
  console.log('✅ Seed completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
