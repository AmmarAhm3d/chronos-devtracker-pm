import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'demo@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Seed: demo user already exists');
    return;
  }
  const password = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: { email, password, name: 'Demo User' }
  });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Sample Portfolio Project',
      description: 'This is a seeded project used for demo purposes',
      status: 'IN_PROGRESS'
    }
  });

  await prisma.task.createMany({
    data: [
      { projectId: project.id, title: 'Design schema', priority: 'HIGH' },
      { projectId: project.id, title: 'Set up CI', priority: 'MEDIUM' },
      { projectId: project.id, title: 'Polish UI', priority: 'LOW' }
    ]
  });

  console.log('Seed complete: demo user, project, tasks created');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});