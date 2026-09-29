import assert from 'node:assert/strict';
import {classifyCustomerMessage} from '../lib/customer-care.ts';

const cases=[
 ['Tôi muốn hoàn tiền','sensitive'],
 ['Có giảm giá thêm không?','sensitive'],
 ['Tôi muốn gặp nhân viên tư vấn','contact'],
 ['Căn SX2-10 giá bao nhiêu?','general'],
];

for(const [message,expected] of cases){
 assert.equal(classifyCustomerMessage(message),expected,`Sai phân loại: ${message}`);
}

console.log(JSON.stringify({ok:true,cases:cases.length}));
