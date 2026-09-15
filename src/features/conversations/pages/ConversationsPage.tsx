import { IconMagnifyingglassLine, IconPlusLine } from "@karrotmarket/react-monochrome-icon";
import { PrefixIcon } from "@seed-design/react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ConversationList } from "../components/ConversationList";

export function ConversationsPage() {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const search = (event: FormEvent) => {
    event.preventDefault();
    setKeyword(input.trim());
  };

  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">AI 생활 도우미</p>
          <h1>대화 목록</h1>
          <p className="page-description">이전 문의와 민원 접수 대화를 다시 확인하세요.</p>
        </div>
        <div className="page-action">
          <Link to="/resident/conversations/new">
            <ActionButton variant="brandSolid"><PrefixIcon svg={<IconPlusLine />} />새 대화</ActionButton>
          </Link>
        </div>
      </header>
      <section className="panel list-panel">
        <form onSubmit={search} role="search">
          <TextField prefixIcon={<IconMagnifyingglassLine />} value={input} onValueChange={({ value }) => setInput(value)}>
            <TextFieldInput aria-label="대화 제목 검색" placeholder="대화 제목 검색 후 Enter" />
          </TextField>
        </form>
        <ConversationList keyword={keyword} />
      </section>
    </>
  );
}
