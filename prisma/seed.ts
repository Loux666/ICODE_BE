import { PrismaClient, ReadingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(" Bắt đầu nạp dữ liệu mẫu (Seeding)...");

  // Xóa dữ liệu cũ nếu có
  await prisma.book.deleteMany({});

  const sampleBooks = [
    {
      workId: "OL82563W",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      coverUrl: "https://covers.openlibrary.org/b/id/8432047-M.jpg",
      publishYear: 1925,
      totalPages: 180,
      description:
        "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
      subjects: JSON.stringify([
        "Fiction",
        "Classics",
        "American Literature",
        "Romance",
      ]),
      status: ReadingStatus.COMPLETED,
      currentPage: 180,
      rating: 5,
      notes:
        "Một tác phẩm kinh điển tuyệt vời về giấc mơ Mỹ và sự lãng mạn đầy bi kịch.",
      startDate: new Date("2026-09-01T08:00:00Z"),
      finishDate: new Date("2026-09-10T15:30:00Z"),
    },
    {
      workId: "OL27448W",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      coverUrl: "https://covers.openlibrary.org/b/id/12003526-M.jpg",
      publishYear: 1937,
      totalPages: 310,
      description:
        "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling further than his pantry.",
      subjects: JSON.stringify([
        "Fantasy",
        "Adventure",
        "Classics",
        "High Fantasy",
      ]),
      status: ReadingStatus.READING,
      currentPage: 155,
      rating: 4,
      notes:
        "Cuộc phiêu lưu của Bilbo cùng đoàn người lùn rất lôi cuốn, đang đọc đến đoạn gặp rồng Smaug.",
      startDate: new Date("2026-09-20T09:00:00Z"),
      finishDate: null,
    },
    {
      workId: "OL45804W",
      title: "1984",
      author: "George Orwell",
      coverUrl: "https://covers.openlibrary.org/b/id/11153217-M.jpg",
      publishYear: 1949,
      totalPages: 328,
      description:
        "A dystopian social science fiction novel and cautionary tale about totalitarianism and surveillance.",
      subjects: JSON.stringify([
        "Dystopia",
        "Classics",
        "Politics",
        "Science Fiction",
      ]),
      status: ReadingStatus.READING,
      currentPage: 82,
      rating: null,
      notes:
        "Thế giới viễn tưởng u tối và nghẹt thở, khắc họa nỗi sợ rất chân thực.",
      startDate: new Date("2026-09-26T14:00:00Z"),
      finishDate: null,
    },
    {
      workId: "OL262758W",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      coverUrl: "https://covers.openlibrary.org/b/id/8225261-M.jpg",
      publishYear: 1960,
      totalPages: 281,
      description:
        "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
      subjects: JSON.stringify([
        "Classics",
        "Historical Fiction",
        "Drama",
        "Legal",
      ]),
      status: ReadingStatus.WANT_TO_READ,
      currentPage: 0,
      rating: null,
      notes:
        "Cuốn sách được đánh giá rất cao, dự định sẽ đọc vào cuối tuần này.",
      startDate: null,
      finishDate: null,
    },
    {
      workId: "OL2163649W",
      title: "Clean Code",
      author: "Robert C. Martin",
      coverUrl: "https://covers.openlibrary.org/b/id/6517178-M.jpg",
      publishYear: 2008,
      totalPages: 464,
      description:
        "A Handbook of Agile Software Craftsmanship, teaching the values of a software craftsman.",
      subjects: JSON.stringify([
        "Programming",
        "Software Engineering",
        "Computer Science",
      ]),
      status: ReadingStatus.COMPLETED,
      currentPage: 464,
      rating: 5,
      notes:
        "Sách gối đầu giường cho lập trình viên, các nguyên tắc đặt tên và refactor hàm rất thực tế.",
      startDate: new Date("2026-08-01T10:00:00Z"),
      finishDate: new Date("2026-08-28T17:00:00Z"),
    },
    {
      workId: "OL17364998W",
      title: "Atomic Habits",
      author: "James Clear",
      coverUrl: "https://covers.openlibrary.org/b/id/12843460-M.jpg",
      publishYear: 2018,
      totalPages: 320,
      description:
        "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
      subjects: JSON.stringify([
        "Self Help",
        "Psychology",
        "Productivity",
        "Personal Development",
      ]),
      status: ReadingStatus.WANT_TO_READ,
      currentPage: 0,
      rating: null,
      notes: "Muốn học cách xây dựng thói quen đọc sách 30 phút mỗi ngày.",
      startDate: null,
      finishDate: null,
    },
  ];

  for (const book of sampleBooks) {
    await prisma.book.create({
      data: book,
    });
  }

  console.log(
    `✅ Đã nạp thành công ${sampleBooks.length} cuốn sách mẫu vào tủ sách!`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi nạp dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
