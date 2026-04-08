const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  await prisma.character.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('senha123', 10);

  const aragorn = await prisma.user.create({
    data: {
      name: 'Aragorn Dunadan',
      email: 'aragorn@lotr.com',
      password: passwordHash,
      characters: {
        create: [
          {
            name: 'Strider',
            race: 'Human',
            class: 'Ranger',
            subclass: 'Hunter',
            background: 'Outlander',
            alignment: 'Lawful Good',
            level: 10,
            experiencePoints: 64000,
            strength: 18,
            dexterity: 16,
            constitution: 14,
            intelligence: 12,
            wisdom: 14,
            charisma: 13,
            maxHitPoints: 94,
            currentHitPoints: 94,
            armorClass: 16,
            speed: 30,
            initiative: 3,
            proficiencyBonus: 4,
            backstory: 'Herdeiro do trono de Gondor, criado pelos elfos em Valfenda.',
            notes: 'Possui o Anel de Barahir e a espada Andúril.'
          },
          {
            name: 'Elessar',
            race: 'Human',
            class: 'Paladin',
            subclass: 'Oath of Devotion',
            background: 'Noble',
            alignment: 'Lawful Good',
            level: 5,
            experiencePoints: 6500,
            strength: 20,
            dexterity: 10,
            constitution: 16,
            intelligence: 11,
            wisdom: 14,
            charisma: 16,
            maxHitPoints: 52,
            currentHitPoints: 52,
            armorClass: 18,
            speed: 30,
            initiative: 0,
            proficiencyBonus: 3,
            backstory: 'Rei ungido de Gondor e Arnor.',
          }
        ]
      }
    }
  });

  const legolas = await prisma.user.create({
    data: {
      name: 'Legolas Greenleaf',
      email: 'legolas@mirkwood.com',
      password: passwordHash,
      characters: {
        create: [
          {
            name: 'Legolas Thranduilion',
            race: 'Elf',
            class: 'Fighter',
            subclass: 'Arcane Archer',
            background: 'Noble',
            alignment: 'Chaotic Good',
            level: 12,
            experiencePoints: 120000,
            strength: 13,
            dexterity: 20,
            constitution: 12,
            intelligence: 14,
            wisdom: 16,
            charisma: 14,
            maxHitPoints: 88,
            currentHitPoints: 88,
            armorClass: 15,
            speed: 35,
            initiative: 5,
            proficiencyBonus: 4,
            backstory: 'Príncipe de Mirkwood, filho de Thranduil.',
            notes: 'Membro da Sociedade do Anel.'
          }
        ]
      }
    }
  });

  console.log(`Criado usuário: ${aragorn.email} (2 personagens)`);
  console.log(`Criado usuário: ${legolas.email} (1 personagem)`);
  console.log('');
  console.log('Seed concluído! Credenciais de teste:');
  console.log('   Email: aragorn@lotr.com | Senha: senha123');
  console.log('   Email: legolas@mirkwood.com | Senha: senha123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
