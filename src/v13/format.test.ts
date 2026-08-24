import {describe,expect,it} from 'vitest';
import {bounds,money} from './format';
describe('format helpers',()=>{it('formats Ghana money without unsupported glyphs',()=>{expect(money(104200)).toBe('GHS 104,200.00')});it('builds a year management period',()=>{expect(bounds('year',new Date('2026-08-24T00:00:00Z'))).toEqual({start:'2026-01-01',end:'2026-12-31',label:'2026'})})});
