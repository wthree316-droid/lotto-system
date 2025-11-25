let currentInput = "";
let currentCategory = "3";
let isReverseMode = false;
let currentSpecialMode = null; // เก็บโหมดพิเศษที่เลือก

const subOptionsData = {
    '3': ['3 ตัวตรง', '3 ตัวโต๊ด', '3 ตัวล่าง', '3 ตัวหน้า'],
    '2': ['2 ตัวบน', '2 ตัวล่าง'],
    'run': ['วิ่งบน', 'วิ่งล่าง']
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. โหลดชื่อหวยจากหน้า Menu (ถ้ามี)
    const lottoName = localStorage.getItem('selectedLottoName');
    const lottoTime = localStorage.getItem('selectedLottoTime');
    
    if (lottoName) {
        document.getElementById('lotto-title').innerText = lottoName;
        document.getElementById('lotto-info').innerText = "ปิดรับ: " + lottoTime;
    } else {
        document.getElementById('lotto-title').innerText = "ทดสอบระบบ";
    }

    // 2. เริ่มต้นค่า
    changeCategory('3');
});

// --- Category & UI Logic ---

function changeCategory(type) {
    currentCategory = type;
    currentInput = "";
    resetSpecialMode();
    updateDisplay();
    updateBadge();

    // สร้าง Checkbox ตัวเลือกย่อย
    const container = document.getElementById('sub-options');
    container.innerHTML = '';
    subOptionsData[type].forEach((opt, index) => {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'btn-check sub-opt-check';
        input.id = `sub-${index}`;
        input.value = opt;
        if(index === 0) input.checked = true; // เลือกตัวแรกเสมอ

        const label = document.createElement('label');
        label.className = 'btn btn-outline-secondary flex-grow-1';
        label.htmlFor = `sub-${index}`;
        label.innerText = opt;

        container.appendChild(input);
        container.appendChild(label);
    });

    // เปิด/ปิด พื้นที่ปุ่มพิเศษ (ใช้ได้แค่ 2 ตัว)
    const specialWrapper = document.getElementById('special-options-wrapper');
    if (type === '2') {
        specialWrapper.classList.remove('disabled-area');
    } else {
        specialWrapper.classList.add('disabled-area');
    }
}

function selectSpecial(mode) {
    if (currentCategory !== '2') return;

    // ถ้ากดซ้ำให้ยกเลิก
    if (currentSpecialMode === mode) {
        resetSpecialMode();
        return;
    }

    currentSpecialMode = mode;
    currentInput = ""; 
    
    // จัดการสีปุ่ม: ล้างสีเก่า -> ใส่สีใหม่
    document.querySelectorAll('.special-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'text-white');
        btn.classList.add('btn-outline-secondary');
    });

    const clickedBtn = event.target;
    clickedBtn.classList.remove('btn-outline-secondary');
    clickedBtn.classList.add('active', 'btn-primary', 'text-white');

    // ปิดระบบกลับเลขเมื่อใช้โหมดพิเศษ
    const reverseBtn = document.getElementById('btn-reverse');
    reverseBtn.checked = false;
    reverseBtn.disabled = true;
    isReverseMode = false;
    
    updateBadge();

    // ถ้าเป็นโหมดไม่ต้องกดเลข (เบิ้ล/คู่/คี่) ให้ทำงานเลย
    if (['double', 'even', 'odd'].includes(mode)) {
        addToList();
        resetSpecialMode();
    }
}

function resetSpecialMode() {
    currentSpecialMode = null;
    
    // คืนค่าสีปุ่มเป็นสีเทาทั้งหมด
    document.querySelectorAll('.special-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'text-white');
        btn.classList.add('btn-outline-secondary');
    });
    
    // ปลดล็อคปุ่มกลับเลข
    document.getElementById('btn-reverse').disabled = false;
    document.getElementById('special-badge').classList.add('d-none');
    updateBadge();
}

function toggleReverse() {
    isReverseMode = document.getElementById('btn-reverse').checked;
    updateBadge();
}

function updateBadge() {
    const badge = document.getElementById('mode-badge');
    const spBadge = document.getElementById('special-badge');

    if (isReverseMode) {
        badge.className = "position-absolute top-0 start-0 m-2 badge bg-danger";
        badge.innerText = "กลับเลข ON";
    } else {
        badge.className = "position-absolute top-0 start-0 m-2 badge bg-secondary";
        badge.innerText = (currentCategory==='3'?'3 ตัว':currentCategory==='2'?'2 ตัว':'เลขวิ่ง');
    }

    if (currentSpecialMode && ['19door','rootFront','rootBack'].includes(currentSpecialMode)) {
        spBadge.classList.remove('d-none');
        let text = "";
        if(currentSpecialMode === '19door') text = "19 ประตู (กด 1 ตัว)";
        if(currentSpecialMode === 'rootFront') text = "รูดหน้า (กด 1 ตัว)";
        if(currentSpecialMode === 'rootBack') text = "รูดหลัง (กด 1 ตัว)";
        spBadge.innerText = text;
    } else {
        spBadge.classList.add('d-none');
    }
}

// --- Keypad & Input Logic ---

function pressKey(num) {
    let maxLen = 0;
    
    // กำหนดจำนวนหลักที่ต้องพิมพ์
    if (currentSpecialMode && ['19door', 'rootFront', 'rootBack'].includes(currentSpecialMode)) {
        maxLen = 1;
    } else {
        maxLen = (currentCategory === '3') ? 3 : (currentCategory === '2') ? 2 : 1;
    }
    
    if (currentInput.length < maxLen) {
        currentInput += num;
        updateDisplay();
    }

    // Auto Submit เมื่อครบหลัก
    if (currentInput.length === maxLen) {
        setTimeout(() => {
            addToList();
        }, 150);
    }
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function clearAll() {
    currentInput = "";
    resetSpecialMode();
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('current-input');
    display.innerText = currentInput === "" ? "_" : currentInput;
    display.className = currentInput === "" ? "text-secondary" : "text-warning";
}

function forceAdd() {
    if(currentInput.length > 0) addToList();
}

// --- Generator & Calculation Logic ---

function generateNumbers() {
    let numbers = [];
    
    if (currentSpecialMode) {
        const n = currentInput; // string
        
        switch (currentSpecialMode) {
            case '19door': // มีเลข n อยู่ในหลักสิบหรือหน่วย
                for (let i = 0; i <= 99; i++) {
                    let s = i.toString().padStart(2, '0');
                    if (s.includes(n)) numbers.push(s);
                }
                break;
            case 'rootFront': // หลักสิบเป็น n
                for (let i = 0; i <= 9; i++) numbers.push(n + i);
                break;
            case 'rootBack': // หลักหน่วยเป็น n
                for (let i = 0; i <= 9; i++) numbers.push(i + n);
                break;
            case 'double': // 00, 11...
                for (let i = 0; i <= 9; i++) numbers.push(i + "" + i);
                break;
            case 'even': // เลขคู่
                for (let i = 0; i <= 99; i++) if (i % 2 === 0) numbers.push(i.toString().padStart(2, '0'));
                break;
            case 'odd': // เลขคี่
                for (let i = 0; i <= 99; i++) if (i % 2 !== 0) numbers.push(i.toString().padStart(2, '0'));
                break;
        }
    } else {
        // โหมดปกติ + กลับเลข
        if (isReverseMode) {
            numbers = getPermutations(currentInput);
        } else {
            numbers = [currentInput];
        }
    }
    return numbers;
}

function getPermutations(numStr) {
    if (!numStr) return [];
    const results = new Set();
    if (numStr.length <= 1) results.add(numStr);
    else if (numStr.length === 2) {
        results.add(numStr);
        results.add(numStr.split('').reverse().join(''));
    } else if (numStr.length === 3) {
        const arr = numStr.split('');
        const permute = (arr, m = []) => {
            if (arr.length === 0) results.add(m.join(''));
            else {
                for (let i = 0; i < arr.length; i++) {
                    let curr = arr.slice();
                    let next = curr.splice(i, 1);
                    permute(curr.slice(), m.concat(next));
                }
            }
        }
        permute(arr);
    }
    return Array.from(results);
}

function addToList() {
    const checkboxes = document.querySelectorAll('.sub-opt-check:checked');
    if (checkboxes.length === 0) {
        alert('กรุณาเลือกประเภทอย่างน้อย 1 อย่าง');
        return;
    }

    const numbersToPlay = generateNumbers();
    if (numbersToPlay.length === 0) return;

    const listContainer = document.getElementById('bet-list');

    checkboxes.forEach(chk => {
        const typeName = chk.value;
        numbersToPlay.forEach(num => {
            const itemDiv = document.createElement('div');
            itemDiv.className = "list-group-item d-flex align-items-center p-2 border-bottom animate-fade";
            itemDiv.innerHTML = `
                <div style="width: 30%; font-weight:bold; font-size:1.1rem;">${num}</div>
                <div style="width: 30%;"><span class="badge bg-info text-dark">${typeName}</span></div>
                <div style="width: 30%;">
                    <input type="number" class="form-control form-control-sm price-input" 
                           placeholder="บาท" onchange="calculateTotal()" onkeyup="calculateTotal()">
                </div>
                <div style="width: 10%; text-align: right;">
                    <button class="btn btn-sm text-danger" onclick="this.parentElement.parentElement.remove(); calculateTotal();"><i class="fas fa-times"></i></button>
                </div>
            `;
            listContainer.prepend(itemDiv);
        });
    });

    currentInput = "";
    if (['19door', 'rootFront', 'rootBack'].includes(currentSpecialMode)) {
        resetSpecialMode();
    }
    updateDisplay();
    calculateTotal();
}

// --- Footer Actions ---

function calculateTotal() {
    let total = 0;
    let count = 0;
    document.querySelectorAll('.price-input').forEach(inp => {
        total += parseInt(inp.value) || 0;
        count++;
    });
    document.getElementById('total-amount').innerText = total.toLocaleString();
    document.getElementById('item-count').innerText = count;
}

function setAllPrices() {
    const price = prompt("ระบุราคา:");
    if(price) {
        document.querySelectorAll('.price-input').forEach(inp => {
            if(inp.value === "") inp.value = price;
        });
        calculateTotal();
    }
}

function clearList() {
    const listContainer = document.getElementById('bet-list');
    if (listContainer.children.length === 0) return;

    if (confirm('คุณต้องการลบรายการทั้งหมดใช่หรือไม่?')) {
        listContainer.innerHTML = '';
        calculateTotal();
    }
}

// ฟังก์ชัน saveBill แบบ Firebase
function saveBill() {
    const items = [];
    let hasError = false;
    let errorMsg = "";

    // 1. ล้างการแจ้งเตือนเก่าก่อน (ถ้ามี)
    document.querySelectorAll('#bet-list .list-group-item').forEach(row => {
        row.style.backgroundColor = ""; // ล้างสีพื้นหลัง
        row.querySelector('.price-input').classList.remove('border', 'border-danger'); // ล้างขอบแดง
    });

    const rows = document.querySelectorAll('#bet-list .list-group-item');

    // วนลูปเช็คทีละรายการ
    rows.forEach(row => {
        // ดึงค่าจากหน้าจอ
        let numberText = row.children[0].innerText.trim();
        let typeText = row.children[1].innerText.trim();
        const priceInput = row.querySelector('.price-input');
        const priceVal = priceInput.value;

        // --- กฏข้อที่ 1: ถ้าเป็นค่าว่าง ให้ "ตัดทิ้งเลย" ---
        if (numberText === "" || numberText === "_" || numberText === "undefined") {
            // return ตรงนี้คือข้ามการทำงานของ "บรรทัดนี้" ไปเลย (Skip) 
            // ไม่เช็คราคา ไม่เก็บข้อมูล เหมือนบรรทัดนี้ไม่มีตัวตน
            return; 
        }

        // --- กฏข้อที่ 2: ตรวจสอบประเภทเลข (Validation) ---
        let isValidFormat = true;

        // ถ้าเป็นหมวด 3 ตัว -> เลขต้องมี 3 หลัก
        if (typeText.includes("3 ตัว")) {
            if (numberText.length !== 3) isValidFormat = false;
        } 
        // ถ้าเป็นหมวด 2 ตัว (รวมถึง 19 ประตู, รูด, เบิ้ล, คู่คี่) -> เลขต้องมี 2 หลัก
        else if (typeText.includes("2 ตัว") || typeText.includes("19") || typeText.includes("รูด") || typeText.includes("เบิ้ล") || typeText.includes("คู่") || typeText.includes("คี่")) {
            if (numberText.length !== 2) isValidFormat = false;
        }
        // ถ้าเป็นหมวด เลขวิ่ง -> เลขต้องมี 1 หลัก
        else if (typeText.includes("วิ่ง")) {
            if (numberText.length !== 1) isValidFormat = false;
        }

        if (!isValidFormat) {
            hasError = true;
            row.style.backgroundColor = "#ffe6e6"; // ไฮไลท์บรรทัดที่เป็นปัญหาด้วยสีแดงอ่อน
            errorMsg = `พบรายการผิดประเภท: "${typeText}" แต่เลขคือ "${numberText}" (จำนวนหลักไม่ถูกต้อง)`;
            return; // หยุดการทำงานบรรทัดนี้ (ไม่บันทึก)
        }

        // --- กฏข้อที่ 3: ตรวจสอบราคา ---
        if (!priceVal || parseInt(priceVal) <= 0) {
            hasError = true;
            priceInput.classList.add('border', 'border-danger'); // ทำขอบแดงที่ช่องราคา
            if(errorMsg === "") errorMsg = "กรุณาใส่ราคาให้ครบทุกรายการ";
        } else {
            // ผ่านทุกด่าน! เก็บเข้าตะกร้า
            items.push({
                number: numberText,
                type: typeText,
                price: parseInt(priceVal)
            });
        }
    });

    // --- สรุปผลการตรวจสอบ ---

    // 1. ถ้ากรองค่าว่างออกหมดแล้ว ไม่เหลือรายการเลย
    if (items.length === 0 && !hasError) {
        alert("ไม่มีรายการที่สมบูรณ์ให้บันทึก (ค่าว่างถูกตัดออกหมดแล้ว)");
        return;
    }

    // 2. ถ้าเจอ Error (เช่น เลขผิดหลัก หรือ ไม่ใส่ราคา)
    if (hasError) {
        alert(errorMsg); // แจ้งเตือน
        return; // ไม่บันทึก
    }

    // 3. ผ่านหมด -> เริ่มกระบวนการบันทึก
    const storedName = localStorage.getItem('agentName') || "ลูกค้าทั่วไป";
    const ownerName = prompt("ยืนยันชื่อลูกค้า:", storedName);
    if (ownerName === null) return; 

    const finalOwnerName = ownerName.trim() === "" ? storedName : ownerName;
    const lottoName = document.getElementById('lotto-title').innerText;
    const total = items.reduce((sum, item) => sum + item.price, 0);

    // ส่งขึ้น Firebase
    db.collection("bills").add({
        agent: localStorage.getItem('agentName'),      
        owner: finalOwnerName,   
        lottoName: lottoName,    
        items: items,            
        total: total,            
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), 
        dateString: new Date().toLocaleString('th-TH') 
    })
    .then(() => {
        alert(`บันทึกสำเร็จ!\nลูกค้า: ${finalOwnerName}\nจำนวน: ${items.length} รายการ`);
        document.getElementById('bet-list').innerHTML = ''; // ล้างหน้าจอ
        calculateTotal();
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("บันทึกไม่สำเร็จ: " + error.message);
    });
}
