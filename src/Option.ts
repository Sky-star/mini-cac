interface OptionConfig {
    default?: any
    type: any[]
}

export class Option {
    name: string
    description: string
    config: OptionConfig
    constructor(rawName: string, description: string, config?: OptionConfig) {
        this.name = rawName
        this.description = description
        this.config = Object.assign({}, config)
    }
}

export type { OptionConfig }