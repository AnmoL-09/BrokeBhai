const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if we can query the database
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful! Found ${userCount} users.`);
    
    // Test if we can write to the database (create a test user)
    console.log('Testing write permissions...');
    const testUser = await prisma.user.create({
      data: {
        clerkUserId: 'test-clerk-id-' + Date.now(),
        email: 'test-' + Date.now() + '@example.com',
        name: 'Test User'
      }
    });
    console.log('✅ Database write successful! Created test user:', testUser.id);
    
    // Clean up - delete the test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user cleaned up successfully');
    
    console.log('\n🎉 All database operations are working correctly!');
    console.log('- Connection: ✅');
    console.log('- Read permissions: ✅');
    console.log('- Write permissions: ✅');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Solution: Make sure you have a .env file with DATABASE_URL configured');
      console.error('Example: DATABASE_URL="postgresql://username:password@localhost:5432/database_name"');
    }
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.error('\n💡 Solution: Make sure your database server is running');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
