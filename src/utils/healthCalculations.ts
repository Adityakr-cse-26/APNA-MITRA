
export type Severity = "normal" | "warning" | "alert" | "unknown";

export function getSeverityForStatus(status: string): Severity {
  const s = status.toLowerCase();
  
  if (s.includes("crisis") || s.includes("critical") || s.includes("very high")) {
    return "alert";
  }
  if (s.includes("high") || s.includes("elevated") || s.includes("low") || s.includes("abnormal") || s.includes("overweight") || s.includes("underweight")) {
    return "warning";
  }
  if (s.includes("waiting") || s.includes("normal") || s.includes("expected range") || s === "") {
    return "normal";
  }
  return "unknown";
}

export function calculateVitalStatus(type: string, value: string, testType?: string): string {
  if (!value) return "Unknown";
  
  try {
    switch (type) {
                  case "bp": {
        const parts = value.split("/");
        
        let sysStr = undefined;
        let diaStr = undefined;
        
        if (parts.length === 2) {
          sysStr = parts[0]?.trim();
          diaStr = parts[1]?.trim();
        } else if (value.startsWith("/")) {
          diaStr = value.substring(1).trim();
        } else {
          sysStr = value.trim();
        }
        
        const sys = sysStr ? parseInt(sysStr, 10) : NaN;
        const dia = diaStr ? parseInt(diaStr, 10) : NaN;
        
        if (!isNaN(sys) && isNaN(dia)) return "Waiting for diastolic reading";
        if (isNaN(sys) && !isNaN(dia)) return "Waiting for systolic reading";
        if (isNaN(sys) || isNaN(dia)) return "Unknown";
        
        // Critical / Crisis: Systolic > 180 OR Diastolic > 120
        if (sys > 180 || dia > 120) return "Critical - seek immediate medical attention";
        
        // HIGH BP – STAGE 2: Systolic >= 140 OR Diastolic >= 90
        if (sys >= 140 || dia >= 90) return "High BP - Stage 2";
        
        // HIGH BP – STAGE 1: Systolic 130–139 OR Diastolic 80–89
        if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return "High BP - Stage 1";
        
        // NORMAL BP: Systolic 90–120 AND Diastolic 60–80
        if (sys >= 90 && sys <= 120 && dia >= 60 && dia <= 80) return "Normal";
        
        // LOW BP: Systolic < 90 AND Diastolic < 60
        if (sys < 90 && dia < 60) return "Low";
        
        // Catch elevated or mixed ranges based on "prioritize higher risk"
        // Let's ensure any other mixed range prioritizes accurately based on remaining gap
        // Between Normal and Low (e.g. 85/70 or 100/55): evaluate as Low since one is low
        if (sys < 90 || dia < 60) return "Low";
        
        // Between Normal and Stage 1 (e.g. 125/75): it's elevated but user rules didn't explicitly name "Elevated".
        // In previous rules it was "Elevated BP". Let's map any remaining >120 to High BP Stage 1 if user skipped Elevated,
        // or just return Elevated since they provided it in earlier prompt, but now omitted.
        // Actually, prompt says: "Evaluate the inputs using these exact thresholds"
        return "Elevated";
      }
      
            case "hr": {
        const hr = parseInt(value, 10);
        if (isNaN(hr)) return "Unknown";
        
        if (hr < 60) return "Low (Bradycardia)";
        if (hr > 100) return "High (Tachycardia)";
        return "Normal";
      }
      
            case "spo2": {
        const spo2 = parseInt(value, 10);
        if (isNaN(spo2)) return "Unknown";
        
        if (spo2 <= 90) return "Critical";
        if (spo2 < 95) return "Low";
        return "Normal";
      }
      
            case "sugar": {
        const sugar = parseInt(value, 10);
        if (isNaN(sugar)) return "Unknown";
        
        const isFasting = testType?.toLowerCase().includes("fasting");
        const isPostMeal = testType?.toLowerCase().includes("after meal") || testType?.toLowerCase().includes("post");
        
        if (isFasting) {
          if (sugar < 70) return "Low";
          if (sugar <= 99) return "Normal";
          return "High";
        } else if (isPostMeal) {
          if (sugar < 70) return "Low";
          if (sugar < 140) return "Normal";
          return "High";
        } else {
          // Random
          if (sugar < 70) return "Low";
          if (sugar < 200) return "Normal";
          return "High";
        }
      }
      
            case "weight": {
        const weight = parseFloat(value);
        if (isNaN(weight)) return "Unknown";
        
        if (weight < 45) return "Underweight";
        if (weight <= 75) return "Normal/Healthy";
        if (weight <= 90) return "Overweight";
        return "High weight";
      }
      
      default:
        return "Unknown";
    }
  } catch (e) {
    return "Unknown";
  }
}

export function getStatusColors(status: string): { bg: string, text: string, border: string, dot: string } {
  const severity = getSeverityForStatus(status);
  switch (severity) {
    case "normal":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "warning":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "alert":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-400" };
  }
}

export function formatDateTime(isoString: string | undefined): string {
  if (!isoString) return "Date unavailable";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Date unavailable";
    
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return "Date unavailable";
  }
}

export function getStatusLabel(status: string): string {
  if (!status || status === "unknown") return "Unknown";
  return status;
}
