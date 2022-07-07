import mri from "mri"
import Command, { GlobalCommand } from "./Command"
import { Option, OptionConfig } from './Option';

interface ParsedArgv {
    args: ReadonlyArray<string>
    options: {
        [k: string]: any
    }
}

class CAC {
    private globalCommand: Command

    constructor() {
        this.globalCommand = new GlobalCommand(this)
    }

    option(rawName: string, description: string, config?: any) {
        this.globalCommand.option(rawName, description, config)
        return this
    }

    parse(rawArray: string[]) {
        const mriResult = mri(rawArray)

        console.log('mri result: ', mriResult);


        const options = this.globalCommand.options.reduce(
            (options, option: Option) => {
                options[option.name] = mriResult[option.name] || option.config.default
                return option
            }, {}
        )

        return {
            args: [],
            options: {
                ...options,
                "--": []
            }
        }

    }
}


export default CAC