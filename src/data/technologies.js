export const technologyGroups = {
  Frontend: ["React", "Next.js", "Vue", "HTML", "CSS", "Tailwind"],
  Backend: ["Node.js", "Express", "Go", "Laravel", "Spring Boot", "Django"],
  Mobile: ["Flutter", "React Native", "Kotlin"],
  Desktop: ["Java", "JavaFX", "Electron", "C#"],
  Database: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
  Programming: ["Java", "JavaScript", "TypeScript", "Python", "Go", "PHP", "C#", "C++", "Kotlin", "Dart"],
};

const toItems = (keys) => keys.flatMap((group) => technologyGroups[group].map((name) => ({ name, group })));

export const marqueeRows = [
  toItems(["Frontend", "Backend", "Mobile"]),
  toItems(["Desktop", "Database", "Programming"]),
];
