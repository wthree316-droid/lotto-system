let currentInput = "";
let currentCategory = "3";
let isReverseMode = false;
let currentSpecialMode = null; 
let autoSubmitTimer = null; 

const subOptionsData = {
    '3': ['ตรง', 'โต๊ด', 'ล่าง', 'หน้า'],
    '2': ['บน', 'ล่าง'],
    'run': ['วิ่งบน', 'วิ่งล่าง']
};

document.addEventListener('DOMContentLoaded', () => {
    const lottoName = localStorage.getItem('selectedLottoName');
    const lottoTime = localStorage.getItem('selectedLottoTime');
    
    if (lottoName) {
        document.getElementById('lotto-title').innerText = lottoName;
        document.getElementById('lotto-info').innerText = "ปิดรับ: " + lottoTime;
    } else {
        document.getElementById('lotto-title').innerText = "ทดสอบระบบ";
    }
    changeCategory('3');
});

// --- 1. ส่วนจัดการหมวดหมู่ ---
function changeCategory(type) {
    currentCategory = type;
    currentInput = "";
    resetSpecialMode();
    updateDisplay();
    updateBadge();

    const container = document.getElementById('sub-options');
    container.innerHTML = '';
    subOptionsData[type].forEach((opt, index) => {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'btn-check sub-opt-check';
        input.id = `sub-${index}`;
        input.value = opt;
        if(index === 0) input.checked = true;

        const label = document.createElement('label');
        label.className = 'btn btn-outline-secondary flex-grow-1';
        label.htmlFor = `sub-${index}`;
        label.innerText = opt;

        container.appendChild(input);
        container.appendChild(label);
    });

    const specialWrapper = document.getElementById('special-options-wrapper');
    if (type === '2') {
        specialWrapper.classList.remove('disabled-area');
    } else {
        specialWrapper.classList.add('disabled-area');
    }
}

function selectSpecial(mode) {
    if (currentCategory !== '2') return;

    if (currentSpecialMode === mode) {
        resetSpecialMode();
        return;
    }

    currentSpecialMode = mode;
    currentInput = ""; 
    
    document.querySelectorAll('.special-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'text-white');
        btn.classList.add('btn-outline-secondary');
    });

    const clickedBtn = event.target;
    clickedBtn.classList.remove('btn-outline-secondary');
    clickedBtn.classList.add('active', 'btn-primary', 'text-white');

    const reverseBtn = document.getElementById('btn-reverse');
    reverseBtn.checked = false;
    reverseBtn.disabled = true;
    isReverseMode = false;
    
    updateBadge();

    // ถ้าเป็นโหมด Instant ให้ทำงานเลย
    if (['double', 'even', 'odd'].includes(mode)) {
        addToList(); 
    }
}

function resetSpecialMode() {
    currentSpecialMode = null;
    document.querySelectorAll('.special-btn').forEach(btn => {
        btn.classList.remove('active', 'btn-primary', 'text-white');
        btn.classList.add('btn-outline-secondary');
    });
    
    const revBtn = document.getElementById('btn-reverse');
    if(revBtn) {
        revBtn.disabled = false;
        revBtn.checked = false;
    }
    isReverseMode = false;
    
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

// --- 2. ส่วนจัดการปุ่มกด (ใส่ Timer กันกดรัว) ---
function pressKey(num) {
    let maxLen = 0;
    if (currentSpecialMode && ['19door', 'rootFront', 'rootBack'].includes(currentSpecialMode)) {
        maxLen = 1;
    } else {
        maxLen = (currentCategory === '3') ? 3 : (currentCategory === '2') ? 2 : 1;
    }
    
    if (currentInput.length < maxLen) {
        currentInput += num;
        updateDisplay();
    }

    // กันเบิ้ล
    if (autoSubmitTimer) clearTimeout(autoSubmitTimer);

    if (currentInput.length === maxLen) {
        autoSubmitTimer = setTimeout(() => {
            addToList();
        }, 200);
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

// --- 3. ส่วนคำนวณเลข (Generator) ---
function generateNumbers() {
    let numbers = [];
    
    if (currentSpecialMode) {
        const n = currentInput;

        // เช็คเฉพาะโหมดที่ต้องใช้เลข (19ประตู/รูด) ถ้าไม่มีเลขให้ว่างไว้
        if (['19door', 'rootFront', 'rootBack'].includes(currentSpecialMode) && n === "") {
            return [];
        }

        switch (currentSpecialMode) {
            case '19door': 
                for (let i = 0; i <= 99; i++) {
                    let s = i.toString().padStart(2, '0');
                    if (s.includes(n)) numbers.push(s);
                }
                break;
            case 'rootFront': 
                for (let i = 0; i <= 9; i++) numbers.push(n + i);
                break;
            case 'rootBack': 
                for (let i = 0; i <= 9; i++) numbers.push(i + n);
                break;
            case 'double': 
                for (let i = 0; i <= 9; i++) numbers.push(i + "" + i);
                break;
            case 'even': 
                for (let i = 0; i <= 99; i++) if (i % 2 === 0) numbers.push(i.toString().padStart(2, '0'));
                break;
            case 'odd': 
                for (let i = 0; i <= 99; i++) if (i % 2 !== 0) numbers.push(i.toString().padStart(2, '0'));
                break;
        }
    } else {
        if (isReverseMode) {
            numbers = getPermutations(currentInput);
        } else {
            if(currentInput === "") return [];
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

// --- 4. ส่วนเพิ่มลงตาราง (Add to List) ---
function addToList() {
    const checkboxes = document.querySelectorAll('.sub-opt-check:checked');
    if (checkboxes.length === 0) return;

    // เช็คความยาวเลข (ยกเว้นโหมด Instant)
    const isInstantMode = ['double', 'even', 'odd'].includes(currentSpecialMode);

    if (!isInstantMode) {
        let requiredLen = 0;
        if (currentSpecialMode && ['19door', 'rootFront', 'rootBack'].includes(currentSpecialMode)) {
            requiredLen = 1;
        } else {
            requiredLen = (currentCategory === '3') ? 3 : (currentCategory === '2') ? 2 : 1;
        }
        if (currentInput.length !== requiredLen) return;
    }

    const numbersToPlay = generateNumbers();
    if (numbersToPlay.length === 0) return;

    const listContainer = document.getElementById('bet-list');

    checkboxes.forEach(chk => {
        const typeName = chk.value;
        numbersToPlay.forEach(num => {
            if(!num || num.trim() === "") return;

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
    if (isInstantMode) {
        resetSpecialMode();
    }
    
    updateDisplay();
    calculateTotal();
}

// --- 5. ส่วนท้ายและบันทึก (Footer & Save) ---
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

// *** ฟังก์ชัน saveBill ฉบับสมบูรณ์ (กรองค่าว่าง + เปลี่ยนหน้า) ***
function saveBill() {
    const items = [];
    let hasError = false;
    let errorMsg = "";

    // ล้างสีแจ้งเตือน
    document.querySelectorAll('#bet-list .list-group-item').forEach(row => {
        row.style.backgroundColor = "";
        row.querySelector('.price-input').classList.remove('border', 'border-danger');
    });

    const rows = document.querySelectorAll('#bet-list .list-group-item');

    rows.forEach(row => {
        let numberText = row.children[0].innerText.trim();
        let typeText = row.children[1].innerText.trim();
        const priceInput = row.querySelector('.price-input');
        const priceVal = priceInput.value;

        // กรองค่าว่าง
        if (numberText === "" || numberText === "_") return;

        // ตรวจความยาว
        let isValidFormat = true;
        if (typeText.includes("3 ตัว") && numberText.length !== 3) isValidFormat = false;
        else if ((typeText.includes("2 ตัว") || typeText.includes("19") || typeText.includes("รูด") || typeText.includes("เบิ้ล") || typeText.includes("คู่") || typeText.includes("คี่")) && numberText.length !== 2) isValidFormat = false;
        else if (typeText.includes("วิ่ง") && numberText.length !== 1) isValidFormat = false;

        if (!isValidFormat) {
            hasError = true;
            row.style.backgroundColor = "#ffe6e6";
            errorMsg = `เลขผิดประเภท: ${numberText} (${typeText})`;
            return;
        }

        if (!priceVal || parseInt(priceVal) <= 0) {
            hasError = true;
            priceInput.classList.add('border', 'border-danger');
            if(errorMsg === "") errorMsg = "กรุณาใส่ราคาให้ครบ";
        } else {
            items.push({ number: numberText, type: typeText, price: parseInt(priceVal) });
        }
    });

    if (items.length === 0 && !hasError) {
        alert("ไม่มีรายการที่สมบูรณ์ให้บันทึก");
        return;
    }
    if (hasError) {
        alert(errorMsg);
        return;
    }

    const storedName = localStorage.getItem('agentName') || "ลูกค้าทั่วไป";
    const ownerName = prompt("ยืนยันชื่อลูกค้า:", storedName);
    if (ownerName === null) return; 

    const finalOwnerName = ownerName.trim() === "" ? storedName : ownerName;
    const lottoName = document.getElementById('lotto-title').innerText;
    const total = items.reduce((sum, item) => sum + item.price, 0);

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
        alert(`บันทึกสำเร็จ!\nลูกค้า: ${finalOwnerName}\nยอดเงิน: ${total.toLocaleString()} บาท`);
        document.getElementById('bet-list').innerHTML = '';
        calculateTotal();
        // *** สั่งเปลี่ยนหน้าตรงนี้ ***
        window.location.href = 'history.html?from=lotto';
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("บันทึกไม่สำเร็จ: " + error.message);
    });
}
