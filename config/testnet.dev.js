import baseConfig from './default'
import config from './testnet'
import moment from 'moment-with-locales-es6'


export default {
  env: 'development',
  entry: 'testnet',
  local: 'online',

  base: `http://localhost:${baseConfig.http.port}/`,
  publicPath: `http://localhost:${baseConfig.http.port}${baseConfig.publicPath}`,

  time: moment(Date.now()).format('LLLL'),

  ...config,
}
