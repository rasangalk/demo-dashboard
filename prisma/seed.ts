import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/*
	Seed Strategy
	1. Hard delete all existing data (respecting FK order) for a clean deterministic state.
	2. Insert Subjects with nested Modules -> SubModules.
	3. Insert Questions per SubModule with 4 answers (1+ correct depending on scenario, mostly exactly one correct here).
	4. Log summary counts.

	Idempotency: Safe to re-run because we clear tables first.
*/

async function clear() {
  // Order matters due to FK constraints with cascading; explicit for clarity.
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.subModule.deleteMany();
  await prisma.module.deleteMany();
  await prisma.subject.deleteMany();
}

type SeedQuestion = {
  text: string;
  answers: { text: string; isCorrect?: boolean }[];
};

type SeedSubModule = {
  name: string;
  description?: string;
  questions: SeedQuestion[];
};

type SeedModule = {
  name: string;
  description?: string;
  subModules: SeedSubModule[];
};

type SeedSubject = {
  name: string;
  description?: string;
  modules: SeedModule[];
};

const seedData: SeedSubject[] = [
  {
    name: 'Aviation ATPL',
    description:
      'Airline Transport Pilot Licence foundational theoretical knowledge.',
    modules: [
      {
        name: 'Principles of Flight',
        description: 'Basic and applied aerodynamics.',
        subModules: [
          {
            name: 'Aerodynamics Basics',
            questions: [
              {
                text: 'Lift on a wing is primarily generated as a result of which pressure relationship?',
                answers: [
                  {
                    text: 'Lower static pressure over the upper surface',
                    isCorrect: true,
                  },
                  { text: 'Higher static pressure over the upper surface' },
                  {
                    text: 'Equal static pressure but higher temperature above',
                  },
                  { text: 'Centrifugal pressure acting outward' },
                ],
              },
              {
                text: 'Induced drag generally decreases when:',
                answers: [
                  {
                    text: 'Airspeed increases (at constant lift)',
                    isCorrect: true,
                  },
                  { text: 'Aspect ratio decreases' },
                  { text: 'Angle of attack decreases below zero' },
                  { text: 'The aircraft climbs at constant IAS' },
                ],
              },
            ],
          },
          {
            name: 'Stall & Drag',
            questions: [
              {
                text: 'The critical angle of attack is the angle at which:',
                answers: [
                  {
                    text: 'Maximum lift coefficient is reached',
                    isCorrect: true,
                  },
                  { text: 'Parasite drag is minimum' },
                  { text: 'Induced drag becomes zero' },
                  { text: 'Lift becomes zero' },
                ],
              },
              {
                text: 'Ground effect reduces:',
                answers: [
                  {
                    text: 'Induced drag close to the surface',
                    isCorrect: true,
                  },
                  { text: 'Parasite drag at all altitudes' },
                  { text: 'Weight of the aircraft' },
                  { text: 'Stall speed in all phases of flight equally' },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Meteorology',
        description: 'Atmospheric structure and weather phenomena.',
        subModules: [
          {
            name: 'Atmosphere & Pressure',
            questions: [
              {
                text: 'Standard sea level pressure and temperature (ISA) are:',
                answers: [
                  { text: '1013.25 hPa and 15°C', isCorrect: true },
                  { text: '1000.00 hPa and 0°C' },
                  { text: '1015.00 hPa and 20°C' },
                  { text: '980.00 hPa and 10°C' },
                ],
              },
              {
                text: 'Pressure lapse rate in the lower standard atmosphere is best described as:',
                answers: [
                  {
                    text: 'Pressure decreases approximately exponentially with altitude',
                    isCorrect: true,
                  },
                  { text: 'Pressure increases linearly with altitude' },
                  { text: 'Pressure remains constant to the tropopause' },
                  {
                    text: 'Pressure decreases linearly at 6.5 hPa per 1000 ft',
                  },
                ],
              },
            ],
          },
          {
            name: 'Clouds & Icing',
            questions: [
              {
                text: 'Supercooled liquid water is most likely in which temperature band?',
                answers: [
                  { text: '0°C to about -20°C', isCorrect: true },
                  { text: 'Above +15°C' },
                  { text: 'Below -40°C' },
                  { text: 'Only exactly at 0°C' },
                ],
              },
              {
                text: 'Rime ice forms when:',
                answers: [
                  {
                    text: 'Small supercooled droplets freeze rapidly on impact',
                    isCorrect: true,
                  },
                  {
                    text: 'Large droplets freeze slowly producing clear layers',
                  },
                  {
                    text: 'Water vapor sublimates directly into ice crystals forming glaze',
                  },
                  { text: 'Airframe temperature is above freezing' },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Human Performance',
        description:
          'Physiological and psychological factors affecting pilots.',
        subModules: [
          {
            name: 'Physiology',
            questions: [
              {
                text: 'Hypoxia risk increases notably above which cabin altitude (unacclimatized)?',
                answers: [
                  { text: '10,000 ft', isCorrect: true },
                  { text: '2,000 ft' },
                  { text: '4,000 ft' },
                  { text: '6,000 ft (no further increase thereafter)' },
                ],
              },
              {
                text: 'A common early symptom of hypoxia is:',
                answers: [
                  { text: 'Impaired judgment / euphoria', isCorrect: true },
                  { text: 'Sharp chest pain' },
                  { text: 'Immediate loss of consciousness' },
                  { text: 'Tunnel vision always first' },
                ],
              },
            ],
          },
          {
            name: 'CRM & Decision Making',
            questions: [
              {
                text: 'Crew Resource Management primarily aims to improve:',
                answers: [
                  {
                    text: 'Interpersonal communication and decision processes',
                    isCorrect: true,
                  },
                  { text: 'Only manual flying precision' },
                  { text: 'Aircraft structural performance' },
                  { text: 'Fuel burn optimization exclusively' },
                ],
              },
              {
                text: 'A hazardous attitude characterized by “I can do it—watch this” is best termed:',
                answers: [
                  { text: 'Macho', isCorrect: true },
                  { text: 'Resignation' },
                  { text: 'Complacency' },
                  { text: 'Invulnerability mitigation' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

async function seed() {
  for (const subject of seedData) {
    const createdSubject = await prisma.subject.create({
      data: {
        name: subject.name,
        description: subject.description,
      },
    });

    for (const mod of subject.modules) {
      const createdModule = await prisma.module.create({
        data: {
          name: mod.name,
          description: mod.description,
          subjectId: createdSubject.id,
        },
      });

      for (const sm of mod.subModules) {
        const createdSubModule = await prisma.subModule.create({
          data: {
            name: sm.name,
            description: sm.description,
            moduleId: createdModule.id,
          },
        });

        for (const q of sm.questions) {
          const createdQuestion = await prisma.question.create({
            data: {
              text: q.text,
              subModuleId: createdSubModule.id,
            },
          });

          // Ensure at least one correct answer; if none flagged in seed entry, mark first.
          const hasCorrect = q.answers.some((a) => a.isCorrect);
          const answers = hasCorrect
            ? q.answers
            : [{ ...q.answers[0], isCorrect: true }, ...q.answers.slice(1)];

          await prisma.answer.createMany({
            data: answers.map((a) => ({
              text: a.text,
              isCorrect: a.isCorrect ?? false,
              questionId: createdQuestion.id,
            })),
          });
        }
      }
    }
  }
}

async function main() {
  console.log('Seeding database...');
  await clear();
  await seed();

  const [subjects, modules, subModules, questions, answers] = await Promise.all(
    [
      prisma.subject.count(),
      prisma.module.count(),
      prisma.subModule.count(),
      prisma.question.count(),
      prisma.answer.count(),
    ]
  );

  console.log('Seed complete:');
  console.table({ subjects, modules, subModules, questions, answers });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
