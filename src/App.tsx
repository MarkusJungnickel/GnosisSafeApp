import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk'
import { Button, Title } from '@gnosis.pm/safe-react-components'
import { Box, Container, Grid, MenuItem, Select, TextField } from '@material-ui/core'
import React, { useEffect } from 'react'
import Web3 from 'web3'
import { toWei } from 'web3-utils'
import { MODULE_ABI } from './ABIs/MODULE_ABI'
import { SAFE_ABI } from './ABIs/SAFE_ABI'

const AddressOne = '0x0000000000000000000000000000000000000001'
const provider = 'https://eth-rinkeby.alchemyapi.io/v2/u4kDg20QopAesjF2c1w_9CuvG84D-78_'
const factory = '0x8c8d43d881a5e33655aa8b8aa90e522ed0dea778'
const web3 = new Web3(provider)
const avatar = '0x529F7DbD167ea367f72d95589DA986d2575F84e7'

// const Container = styled.div`
//   padding: 4rem;
//   width: 50%;
//   height: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
// `

const params = {
  safeTxGas: 500000,
}

const SafeApp = (): React.ReactElement => {
  const { sdk, safe } = useSafeAppsSDK()
  const [committeeData, setCommitteeData] = React.useState<any>([])
  const [dataFetched, setDataFetched] = React.useState(false)
  useEffect(() => {
    fetchCommitteeData()
  }, [])

  async function fetchCommitteeData() {
    const moduleAddresses = await fetchSafeModulesAddress()
    const moduleAddress = moduleAddresses[0]
    const module = new web3.eth.Contract(MODULE_ABI, moduleAddress)
    const name = await module.methods.name().call()
    const sector = await module.methods.sector().call()
    const committeeDataTmp = {
      address: moduleAddress,
      coreInfo: { name: name, sector: sector },
    }
    console.log(committeeDataTmp)
    setCommitteeData(committeeDataTmp)
    setDataFetched(true)
  }

  async function fetchSafeModulesAddress() {
    const safeAddress = safe.safeAddress.toString()
    const safeContract = new web3.eth.Contract(SAFE_ABI, safeAddress)
    const modules = await safeContract.methods.getModulesPaginated(AddressOne, 50).call()
    return modules[0] as string[]
  }

  async function sendEthTransact(to: any, amount: any) {
    const modules = await fetchSafeModulesAddress()

    // const moduleAddress: string = getNonFactoryModule(modules)
    // console.log(moduleAddress)
    console.log('fetch modules: ', getNonFactoryModule(modules))
    const moduleAddress = modules[0]

    const module = new web3.eth.Contract(MODULE_ABI, moduleAddress)

    console.log(to, amount, avatar)
    try {
      const txs = [
        {
          to: moduleAddress,
          value: '0',
          data: module.methods.sendEth(to, amount, avatar).encodeABI(),
        },
      ]
      const { safeTxHash } = await sdk.txs.send({ txs, params })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }

  console.log('Safe recognised: ', safe.safeAddress)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const amount = toWei(data.get('amount')!.toString())
    sendEthTransact(data.get('to'), amount)
  }
  let headerElement = <div></div>
  if (dataFetched)
    headerElement = (
      <a
        target="_blank"
        href={'https://rinkeby.etherscan.io/address/' + committeeData.address}
        style={{ textDecoration: 'none', color: 'black' }}
      >
        <Title size={'sm'} strong>
          {committeeData.coreInfo.name}
        </Title>
      </a>
    )

  return (
    <Container>
      <Box sx={{ mt: 4, ml: 4, width: '70%', border: 1 }}>
        {headerElement}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, border: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="amount" required fullWidth id="amount" label="Amount" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select labelId="token" id="token" label="Token" variant="outlined">
                <MenuItem value={10}>ETH</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth id="to" label="Recipient" name="to" />
            </Grid>
            <Grid item xs={12}>
              <Select labelId="avatar" id="avatar" label="Avatar" variant="outlined">
                <MenuItem value={10}>Core Treasury</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: 1, borderColor: 'black' }}>
                <Button type="submit" size="lg" fullWidth>
                  Click to send
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default SafeApp

function getNonFactoryModule(modules: string[]) {
  let returnValue = ''
  modules.forEach((module) => {
    if (module != factory) {
      returnValue = module
    }
  })
  return returnValue
}
// <Box
// component="form"
// sx={{ m: 1, width: '25ch' }
// }
// //noValidate
// // autoComplete="off"
// >
// <TextField id="recipient" label="Recipient" variant="outlined" />
// <TextField id="amount" label="Amount" variant="outlined" />
// </Box>

// const submitTx = useCallback(async () => {
//   try {
//     const { safeTxHash } = await sdk.txs.send({txs, params})
//     console.log({ safeTxHash })
//     const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
//     console.log({ safeTx })
//   } catch (e) {
//     console.error(e)
//   }
// }, [safe, sdk])

// if(false){

// }
