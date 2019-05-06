## Atomicswapwallet.io
[![Build Status](https://travis-ci.org/swaponline/swap.react.svg?branch=master)](https://travis-ci.org/swaponline/swap.react)

Atomic swap cryptocurrency protocol. Live version here: https://Atomicswapwallet.io.



![](https://graphs.waffle.io/swaponline/swap.react/throughput.svg)



## Swap  React

### Install

1) Clone repository with submodules (swap.core)
```
git clone --recurse-submodules https://github.com/Cointorox/AtomicSwapWallet.git
```

2) Do `npm i` <br />
```
cd swap.react
npm i
```

3) Do `git submodule update` in AtomicSwapWallet directory

4) For dev mode `npm run start`, for prod `npm run build`

```
npm run start
```

### HTML widget
1. npm run build:mainnet-widget {erc20contract} {name} {decimals} {tiker}

Example:
```
npm run build:mainnet-widget 0x9E4AD79049282F942c1b4c9b418F0357A0637017 noxon 0 noxon
tar czf my-widget.tar.gz build-mainnet-widget
```
2. Upload to your domain (https://domain.com/build-mainnet-widget)
3. Embed via iframe like
```
<iframe src="build-mainnet-widget/index.html" border=0 style="botder:0;width:800px;height:700px"></iframe>
```
