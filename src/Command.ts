import CAC from './CAC';
import { Option, OptionConfig } from './Option';

interface CommandConfig {

}

class Command {
    public options: Option[]

    constructor(
        rawName: string,
        description: string,
        config: CommandConfig = {},
        cli: CAC
    ) {
        this.options = []
    }

    option(rawName: string, description: string, config?: OptionConfig) {
        const option = new Option(rawName, description, config)
        this.options.push(option)
        return this
    }
}

// 全局 command 
class GlobalCommand extends Command {
    constructor(cli: CAC) {
        super("@@global@@", '', {}, cli)
    }
}

export { GlobalCommand }

export default Command