import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def audit_file(filepath):
    print(f"[*] Auditing: {filepath}")
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    findings = []
    lines = content.splitlines()

    # 1. Check for console.log
    for idx, l in enumerate(lines, 1):
        if 'console.log' in l:
            findings.append((idx, "MEDIUM", "console.log found: potential leakage of sensitive data"))

    # 2. Check for innerHTML with unescaped variables
    for idx, l in enumerate(lines, 1):
        if 'innerHTML' in l and ('`' in l or '+' in l):
            # Check if escapeHTML is used
            if 'escapeHTML' not in l and any(k in l for k in ['input', 'val', 'Word', 'user', 'query', 'feedback']):
                findings.append((idx, "HIGH", f"Potential DOM XSS in innerHTML: {l.strip()[:80]}"))

    # 3. Check for Math.random() instead of crypto.getRandomValues
    for idx, l in enumerate(lines, 1):
        if 'Math.random' in l:
            findings.append((idx, "CRITICAL", "Math.random() is cryptographically insecure for key generation!"))

    # 4. Check for modulo bias
    for idx, l in enumerate(lines, 1):
        if '% 6' in l and 'maxAcceptable' not in content:
            findings.append((idx, "HIGH", "Possible modulo bias in random roll generation"))

    return findings

def main():
    root = r'D:\2025\crypto-dice-seed'
    target_files = ['app.js', 'index.html', 'i18n.js']
    total_findings = 0

    print("==================================================")
    print(" KRYPTONSEED CYBERSECURITY AUDIT SUITE v1.0")
    print("==================================================")

    for fname in target_files:
        fpath = os.path.join(root, fname)
        if os.path.exists(fpath):
            findings = audit_file(fpath)
            if findings:
                total_findings += len(findings)
                for line, severity, desc in findings:
                    print(f"  [{severity}] Line {line}: {desc}")
            else:
                print(f"  [OK] No vulnerabilities found in {fname}")

    print("--------------------------------------------------")
    print(f"Audit Complete. Total findings: {total_findings}")
    print("==================================================")

if __name__ == '__main__':
    main()
