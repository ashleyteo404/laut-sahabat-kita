/* eslint-disable @typescript-eslint/no-require-imports */

const { join } = require('node:path')
const sharp = require('sharp')

const publicDirectory = join(process.cwd(), 'public')
const source = join(publicDirectory, 'ocean-passport-icon.svg')
const icons = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon-32.png', 32],
]

async function main() {
  await Promise.all(
    icons.map(([name, size]) =>
      sharp(source).resize(size, size).png().toFile(join(publicDirectory, name)),
    ),
  )
  console.log(`Generated ${icons.length} PWA icons.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
