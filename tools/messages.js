import {
  transform,
} from 'babel-core'
import {
  readFile,
  writeFile,
  glob,
} from './libs/fs'


const locales = {
  en: 'English',
  ru: 'Russian',
}

const GLOB_PATTERN = 'shared/**/*.{js,ts,tsx}'
const GLOB_IGNORE = []
const fileToMessages = {}
let messages = {}

const posixPath = fileName => fileName.replace(/\\/g, '/')

async function writeMessages(fileName, msgs) {
  return await writeFile(fileName, `${JSON.stringify(msgs, null, 2)}\n`)
}

/**
 * merge messages to source files
 * */
async function mergeToJson(locale, toBuild) {
  const fileName = `shared/localisation/${locale}.json`
  const oldMessages = {}
  try {
    const localisationFile = await readFile(fileName)
    let oldJson
    try {
      oldJson = JSON.parse(localisationFile)
    } catch (err) {
      throw new Error(`Error during parsing messages JSON in file ${fileName}`)
    }

    oldJson.forEach(message => {
      oldMessages[message.id] = message
      delete oldMessages[message.id].files
    })
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  Object.keys(messages).forEach(id => {
    const newMessage = messages[id]
    oldMessages[id] = oldMessages[id] || { id }
    const msg = oldMessages[id]
    msg.description = newMessage.description || msg.description
    msg.defaultMessage = newMessage.defaultMessage || msg.defaultMessage
    msg.message = msg.message || msg.defaultMessage
    msg.files = newMessage.files
    delete msg.description
    delete msg.defaultMessage
  })

  const result = Object.keys(oldMessages).map(key => oldMessages[key]).filter(msg => msg.files || msg.message)

  await writeMessages(fileName, result)

  console.info(`Messages updated in: ${fileName}`)

  if (toBuild && locale !== '_default') {
    const buildFileName = `build/messages/${locale}.json`
    try {
      await writeMessages(buildFileName, result)
      console.info(`Build messages updated: ${buildFileName}`)
    } catch (err) {
      console.error(`Failed to update: ${buildFileName}`)
    }
  }
}

/**
 * Call everytime before updating file!
 * */
function mergeMessages() {
  messages = {}
  Object.keys(fileToMessages).forEach(fileName => {
    fileToMessages[fileName].forEach(newMsg => {
      if (messages[newMsg.id]) {
        if (messages[newMsg.id].defaultMessage !== newMsg.defaultMessage) {
          throw new Error(`Different message default messages for message id "${
            newMsg.id
          }":
          ${messages[newMsg.id].defaultMessage} -- ${messages[newMsg.id].files}
          ${newMsg.defaultMessage} -- ${fileName}`)
        }
        if (messages[newMsg.id].description && newMsg.description) {
          throw new Error(`Should be only one description for message id "${
            newMsg.id
          }":
          ${messages[newMsg.id].description} -- ${messages[newMsg.id].files}
          ${newMsg.description} -- ${fileName}`)
        }
      }
      const message = messages[newMsg.id] || {}
      messages[newMsg.id] = {
        description: newMsg.description || message.description,
        defaultMessage: newMsg.defaultMessage || message.defaultMessage,
        message: newMsg.message || message.message || '',
        files: message.files ? [...message.files, fileName].sort() : [fileName],
      }
    })
  })
}

/**
 * Update messages
 */
async function updateMessages(toBuild) {
  mergeMessages()
  await Promise.all(
    ['_default', ...Object.keys(locales)].map(locale => mergeToJson(locale, toBuild))
  )
}

/**
 * Extract react-intl messages.
 */
async function extractMessages() {
  const compare = (a, b) => {
    if (a === b) {
      return 0
    }

    return a < b ? -1 : 1
  }

  const compareMessages = (a, b) => compare(a.id, b.id)

  const extractFromSingleFile = async fileName => {
    try {
      const source = await readFile(fileName)
      const posixName = posixPath(fileName)
      const result = transform(source, {
        babelrc: true,
        plugins: [
          'react-intl',
        ],
        filename: fileName,
      })
        .metadata['react-intl']
      if (result.messages && result.messages.length) {
        fileToMessages[posixName] = result.messages.sort(compareMessages)
      } else {
        delete fileToMessages[posixName]
      }
    } catch (err) {
      console.error(`extractMessages:\nFile: ${fileName}\n`, err.codeFrame || err)
    }
  }

  const files = await glob(GLOB_PATTERN, GLOB_IGNORE)
  await Promise.all(files.map(extractFromSingleFile))
  await updateMessages()
}

export default extractMessages
