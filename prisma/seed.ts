import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const players = [
  // Pilares
  { name: "Thomas Gallo", position: "Pilar" },
  { name: "Joel Sclavi", position: "Pilar" },
  { name: "Nahuel Tetaz Chaparro", position: "Pilar" },
  { name: "Francisco Gómez Kodela", position: "Pilar" },
  { name: "Mayco Vivas", position: "Pilar" },
  { name: "Santiago García Botta", position: "Pilar" },
  { name: "Lucas Paulos", position: "Pilar" },
  { name: "Eduardo Bello", position: "Pilar" },
  { name: "Rodrigo Martínez", position: "Pilar" },
  { name: "Ignacio Calles", position: "Pilar" },
  // Hookers
  { name: "Julián Montoya", position: "Hooker" },
  { name: "Agustín Creevy", position: "Hooker" },
  { name: "Ignacio Ruiz", position: "Hooker" },
  { name: "Facundo Bosch", position: "Hooker" },
  // Segunda línea
  { name: "Matías Alemanno", position: "Segunda línea" },
  { name: "Guido Petti", position: "Segunda línea" },
  { name: "Tomás Lavanini", position: "Segunda línea" },
  { name: "Pedro Rubiolo", position: "Segunda línea" },
  { name: "Franco Molina", position: "Segunda línea" },
  { name: "Lautaro Bazan Vélez", position: "Segunda línea" },
  // Alas
  { name: "Marcos Kremer", position: "Ala" },
  { name: "Juan Martín González", position: "Ala" },
  { name: "Pablo Matera", position: "Ala" },
  { name: "Rodrigo Bruni", position: "Ala" },
  { name: "Facundo Isa", position: "Ala" },
  { name: "Joaquín Oviedo", position: "Ala" },
  { name: "Santiago Grondona", position: "Ala" },
  { name: "Bautista Pedemonte", position: "Ala" },
  // N°8
  { name: "Rodrigo Fernández Criado", position: "N°8" },
  { name: "Tomás Lezana", position: "N°8" },
  { name: "Facundo Gattas", position: "N°8" },
  // Medios scrum
  { name: "Gonzalo Bertranou", position: "Medio scrum" },
  { name: "Tomás Cubelli", position: "Medio scrum" },
  { name: "Felipe Ezcurra", position: "Medio scrum" },
  { name: "Lautaro Bazán", position: "Medio scrum" },
  { name: "Santiago Díaz", position: "Medio scrum" },
  // Aperturas
  { name: "Santiago Carreras", position: "Apertura" },
  { name: "Nicolás Sánchez", position: "Apertura" },
  { name: "Domingo Miotti", position: "Apertura" },
  { name: "Benjamín Urdapilleta", position: "Apertura" },
  // Centros
  { name: "Jerónimo de la Fuente", position: "Centro" },
  { name: "Matías Orlando", position: "Centro" },
  { name: "Juan Cruz Mallía", position: "Centro" },
  { name: "Lucio Cinti", position: "Centro" },
  { name: "Santiago Chocobares", position: "Centro" },
  { name: "Tomás Albornoz", position: "Centro" },
  { name: "Nicolás Freitas", position: "Centro" },
  // Wings
  { name: "Mateo Carreras", position: "Wing" },
  { name: "Bautista Delguy", position: "Wing" },
  { name: "Rodrigo Isgró", position: "Wing" },
  { name: "Emiliano Boffelli", position: "Wing" },
  { name: "Juan Imhoff", position: "Wing" },
  { name: "Sebastián Cancelliere", position: "Wing" },
  { name: "Franco Sabato", position: "Wing" },
  // Fullbacks
  { name: "Juan Cruz Mallía", position: "Full" },
  { name: "Emiliano Boffelli", position: "Full" },
  { name: "Santiago Carreras", position: "Full" },
  { name: "Tomás Cubelli", position: "Full" },
  // Jugadores adicionales para completar plantel
  { name: "Ignacio Fernández Lobbe", position: "Ala" },
  { name: "Lautaro Coronel", position: "Wing" },
  { name: "Tomás Pascual", position: "Apertura" },
  { name: "Rodrigo Martínez Viale", position: "Pilar" },
  { name: "Agustín Doménech", position: "Pilar" },
  { name: "Manuel Bernasconi", position: "Segunda línea" },
  { name: "Ignacio Larrañaga", position: "Ala" },
  { name: "Lautaro Herrera", position: "Medio scrum" },
  { name: "Rodrigo Paisio", position: "Centro" },
  { name: "Santiago Montagner", position: "Hooker" },
  { name: "Juan José Imhoff", position: "Wing" },
  { name: "Nicolás Gravagnone", position: "Segunda línea" },
  { name: "Tomás Díaz", position: "Pilar" },
  { name: "Lucas Noguera Paz", position: "Pilar" },
  { name: "Matías Moroni", position: "Centro" },
  { name: "Bautista Ezcurra", position: "Medio scrum" },
  { name: "Nicolás Mazzio", position: "Hooker" },
  { name: "Joaquín Díaz Bonilla", position: "Apertura" },
  { name: "Gastón Revol", position: "Full" },
  { name: "Ramiro Moyano", position: "Wing" },
  { name: "Tomás Lezana", position: "N°8" },
  { name: "Martín Landajo", position: "Medio scrum" },
  { name: "Santiago González Iglesias", position: "Apertura" },
  { name: "Ignacio Mieres", position: "Full" },
  { name: "Ramiro Herrera", position: "Wing" },
  { name: "Luciano Alem", position: "Ala" },
  { name: "Rodrigo Báez", position: "Centro" },
  { name: "Marcos Moneta", position: "Wing" },
  { name: "Agustín Creevy", position: "Hooker" },
  { name: "Martín Bogado", position: "N°8" },
  { name: "Nicolás Casillo", position: "Pilar" },
  { name: "Gonzalo García", position: "Segunda línea" },
  { name: "Facundo Mazzucato", position: "Ala" },
  { name: "Juan Martín Hernández", position: "Full" },
  { name: "Lucas Bur", position: "Wing" },
  { name: "Agustín Rangi", position: "Centro" },
  { name: "Santiago Fernández", position: "Medio scrum" },
  { name: "Rodrigo Lavanini", position: "Segunda línea" },
  { name: "Tomás Albornoz Jr", position: "Centro" },
  { name: "Diego Ulberich", position: "Pilar" },
  { name: "Ignacio García Gadea", position: "Pilar" },
  { name: "Pedro Sporleder", position: "Segunda línea" },
]

async function main() {
  console.log("Seeding jugadores...")
  for (const player of players) {
    await prisma.player.create({ data: player })
  }
  console.log(`${players.length} jugadores creados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
