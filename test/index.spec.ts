import { test, expect } from 'vitest';
import { cac } from '../src';

test('basic-usage', () => {
    const cli = cac()

    // 选项参数
    cli.option("--type foo", "Choose a project type")

    // 模拟终端输入指令
    const parsed = cli.parse(["", "", "--type", "foo"])

    expect(parsed).toEqual({
        args: [],
        options: {
            types: "foo",
            "--": []
        }
    })
});