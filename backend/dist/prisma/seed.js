import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const books = [
        { title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/51-uspgqWIL._SX329_BO1,204,203,200_.jpg', description: 'Tiny changes, remarkable results.', linkUrl: 'https://jamesclear.com/atomic-habits' },
        { title: 'The Power of Now', author: 'Eckhart Tolle', coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/41WIbflfWzL.jpg', description: 'A guide to spiritual enlightenment.' },
        { title: 'Mindset', author: 'Carol S. Dweck', coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/51Gg1q2QhPL._SX331_BO1,204,203,200_.jpg', description: 'The new psychology of success.' },
        { title: 'Deep Work', author: 'Cal Newport', coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/41K8H3jD1+L._SX331_BO1,204,203,200_.jpg', description: 'Rules for focused success in a distracted world.' },
        { title: 'The Happiness Advantage', author: 'Shawn Achor', coverUrl: 'https://images-na.ssl-images-amazon.com/images/I/41b4m8kKbmL._SX331_BO1,204,203,200_.jpg', description: 'The seven principles of positive psychology.' },
    ];
    const videos = [
        { title: 'How to Stop Overthinking', youtubeId: 'ZkdU1dO3Nww', thumbnailUrl: 'https://img.youtube.com/vi/ZkdU1dO3Nww/hqdefault.jpg', description: 'Practical steps to calm your mind.' },
        { title: 'Morning Motivation', youtubeId: 'ZXsQAXx_ao0', thumbnailUrl: 'https://img.youtube.com/vi/ZXsQAXx_ao0/hqdefault.jpg', description: 'Start your day inspired.' },
        { title: 'Mindfulness Meditation', youtubeId: 'inpok4MKVLM', thumbnailUrl: 'https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg', description: '10-minute guided meditation.' },
        { title: 'Growth Mindset', youtubeId: 'KUWn_TJTrnU', thumbnailUrl: 'https://img.youtube.com/vi/KUWn_TJTrnU/hqdefault.jpg', description: 'Develop a growth mindset.' },
        { title: 'Stoic Wisdom', youtubeId: 'csik-1m0LkY', thumbnailUrl: 'https://img.youtube.com/vi/csik-1m0LkY/hqdefault.jpg', description: 'Timeless lessons for resilience.' },
    ];
    await prisma.book.deleteMany();
    await prisma.video.deleteMany();
    await prisma.book.createMany({ data: books });
    await prisma.video.createMany({ data: videos });
    // Ensure demo user profile for local testing (optional)
    await prisma.userProfile.upsert({
        where: { id: 'demo_user' },
        update: {},
        create: { id: 'demo_user', email: 'demo@example.com', displayName: 'Demo User' },
    });
    // Create today checklist for demo user
    const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    await prisma.dailyChecklist.upsert({
        where: { userId_date: { userId: 'demo_user', date: today } },
        update: {},
        create: { userId: 'demo_user', date: today },
    });
    // eslint-disable-next-line no-console
    console.log('Seeded books and videos.');
}
main()
    .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
