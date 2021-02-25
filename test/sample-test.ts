import {expect} from 'chai';
import {ethers} from 'hardhat';
import {Greeter, Greeter__factory} from '../typechain';
import {createEventChannel, getEventChannelGeneratorInstance} from '../src/utils';


describe('Greeter', () => {
  it('Should return the new greeting once it\'s changed', async () => {
    const Greeter = await ethers.getContractFactory("Greeter") as Greeter__factory;
    const greeter = await Greeter.deploy("Hello, world!");

    await greeter.deployed();
    const GreetingSetEventChannel = createEventChannel<{value: string}>(greeter, greeter.filters.GreetingSet(null));
    const getGreetingSetEvent = GreetingSetEventChannel.instance();

    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");

    const event = await getGreetingSetEvent();
    GreetingSetEventChannel.clear();

    const gen = getEventChannelGeneratorInstance(GreetingSetEventChannel);

    for await (let ev of gen) {
      console.log(ev?.args.value)
    }

    expect(event).to.not.be.undefined;
    expect(event!.args.value).to.equal('Hola, mundo!');
  });
});
