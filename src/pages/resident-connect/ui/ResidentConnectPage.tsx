import { IconCheckmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";

export function ResidentConnectPage() {
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  return <div className="focused-flow"><div className="focused-brand"><span className="brand-mark">집</span><strong>집사이</strong></div><div className="flow-progress"><span className="active" /><span className={step !== "input" ? "active" : ""} /><span className={step === "done" ? "active" : ""} /></div>{step === "input" && <div className="flow-card"><p className="eyebrow">입주 연결</p><h1>초대코드를 입력해 주세요</h1><p>관리자에게 받은 6자리 코드를 입력하면 내 호실과 연결돼요.</p><TextField label="초대코드" description="영문 대문자와 숫자 6자리"><TextFieldInput defaultValue="AB3K9F" aria-label="초대코드" /></TextField><ActionButton variant="brandSolid" onClick={() => setStep("confirm")}>코드 확인</ActionButton></div>}{step === "confirm" && <div className="flow-card"><p className="eyebrow">세대 확인</p><h1>이 세대가 맞나요?</h1><div className="unit-confirm"><span className="large-symbol">302</span><h2>A타워 302호</h2><p>관리자 김관리</p></div><div className="button-column"><ActionButton variant="brandSolid" onClick={() => setStep("done")}>맞아요, 연결할게요</ActionButton><ActionButton variant="neutralOutline" onClick={() => setStep("input")}>다시 입력</ActionButton></div></div>}{step === "done" && <div className="flow-card flow-card--center"><span className="success-icon"><IconCheckmarkCircleFill /></span><h1>A타워 302호에 연결됐어요</h1><p>이제 AI 생활 도우미와 민원 기능을 사용할 수 있어요.</p><Link to="/resident"><ActionButton variant="brandSolid">홈으로 가기</ActionButton></Link></div>}</div>;
}
