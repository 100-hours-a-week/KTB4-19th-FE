import { IconCheckmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { Logo } from "@/shared/ui";
import { apiRequest, tokenStore } from "@/shared/api";
import { useAuth } from "@/entities/session";

export function ResidentConnectPage() {
  const auth = useAuth();
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connect = async () => {
    setPending(true); setError(null);
    try {
      const result = await apiRequest<{ buildingName: string; roomNo: string; accessToken: string }>("/residents/me/room", { method: "PUT", body: { code } });
      tokenStore.set(result.accessToken);
      await auth.refresh();
      setStep("done");
    } catch { setError("초대코드를 확인하지 못했어요. 코드를 다시 확인해 주세요."); }
    finally { setPending(false); }
  };
  return <div className="focused-flow"><div className="focused-brand"><Logo /></div><div className="flow-progress"><span className="active" /><span className={step !== "input" ? "active" : ""} /><span className={step === "done" ? "active" : ""} /></div>{step === "input" && <div className="flow-card"><p className="eyebrow">입주 연결</p><h1>초대코드를 입력해 주세요</h1><p>관리자에게 받은 6자리 코드를 입력하면 내 호실과 연결돼요.</p><TextField label="초대코드" description="영문 대문자와 숫자 6자리"><TextFieldInput value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} aria-label="초대코드" /></TextField>{error && <p className="inline-error">{error}</p>}<ActionButton variant="brandSolid" disabled={code.length !== 6 || pending} loading={pending} onClick={() => setStep("confirm")}>코드 확인</ActionButton></div>}{step === "confirm" && <div className="flow-card"><p className="eyebrow">세대 연결</p><h1>입주를 확정할까요?</h1><p>초대코드 {code}로 연결합니다.</p><div className="button-column"><ActionButton variant="brandSolid" loading={pending} onClick={connect}>맞아요, 연결할게요</ActionButton><ActionButton variant="neutralOutline" onClick={() => setStep("input")}>다시 입력</ActionButton></div></div>}{step === "done" && <div className="flow-card flow-card--center"><span className="success-icon"><IconCheckmarkCircleFill /></span><h1>입주 등록이 완료됐어요</h1><p>이제 AI 생활 도우미와 민원 기능을 이용할 수 있어요.</p><Link to="/resident"><ActionButton variant="brandSolid">홈으로 가기</ActionButton></Link></div>}</div>;
}
