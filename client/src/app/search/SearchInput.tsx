"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";

import styles from "./page.module.css";

export function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const input = e.target.value;
    setQuery(input);

    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className={styles.inputContainer}>
      <IoSearch size={24} />
      <input
        type="text"
        placeholder="Pesquise por livros, autores, gêneros..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
