const fs = require('fs');

let code = fs.readFileSync('src/components/RegistrationModal.tsx', 'utf8');

// The block to extract
const startMarker = '<div className="pt-4 mt-4 border-t border-[#E2E4E0]">';
const endMarker = 'Enable Notifications\n                    </button>\n                  </div>\n                </div>\n              </div>';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find the block to extract");
    process.exit(1);
}

const blockToMove = code.substring(startIndex, endIndex);

// Remove block from Tab 1
code = code.substring(0, startIndex) + code.substring(endIndex);

// Insert block at end of Tab 2
const insertMarker = '              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F3F5F4] mt-2">\n                <div className="flex items-center gap-1 w-full sm:w-auto">\n                  <button\n                    type="button"\n                    onClick={onClose}';
const insertIndex = code.indexOf(insertMarker);

if (insertIndex === -1) {
    console.error("Could not find insertion point");
    process.exit(1);
}

code = code.substring(0, insertIndex) + blockToMove + '\n' + code.substring(insertIndex);

fs.writeFileSync('src/components/RegistrationModal.tsx', code);
console.log("Successfully moved section.");
