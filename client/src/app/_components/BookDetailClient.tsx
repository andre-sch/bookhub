"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ReserveModal } from "@/app/_components/ReserveModal";
import { BookCover } from "@/app/_components/BookCover";
import { Expand } from "@/app/_components/Expand";
import { useAuth } from "../_context/AuthContext";

import styles from "./BookDetailClient.module.css";

interface Book {
  workID?: string,
  title: string;
  subtitle: string;
  description: string;
  authors: {
    ID: string;
    name: string;
  }[];
  publisher?: {
    name: string;
    displayName: string;
  } | null;
  categoryTree?: {
    ID: string;
    name: string;
    decimal: string;
    level: number;
  }[];
  cover?: string;
  edition?: string;
  language?: {
    isoCode: string;
    name: string;
  };
  numberOfPages: number;
  numberOfVisits: number;
  createdAt: number;
}

interface Item {
  ID: string;
  status: string;
  isbn: string;
  createdAt: number;
}

interface BookDetailsClientProps {
  isbn: string;
  book: Book;
  items: Item[];
}

export function BookDetailsClient({ isbn, book, items }: BookDetailsClientProps) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Verifica se há algum item disponível para reserva
  const availableItem = items.find(item => item.status === "disponivel");

  let reserveDisabled = false;
  let reserveLabel = "Reserve";
  if (!isAuthenticated) {
    reserveDisabled = true;
    reserveLabel = "Login to reserve";
  } else if (!availableItem) {
    reserveDisabled = true;
    reserveLabel = "No items available";
  }

  return (
    <div className={styles.container}>
      <Link href="/">Back to homepage</Link>
      <div className={styles.content}>
        <div>
          <BookCover coverID={book.cover} />
          <button 
            className={styles.btnPrimary}
            onClick={() => {
              if (!reserveDisabled) setOpen(true);
            }}
            disabled={reserveDisabled}
          > 
            {reserveLabel}
          </button>
          <button>Add to wishlist</button>
        </div>
        <div>
          <Expand className={styles.subject} maxHeight={280}>
            {book.categoryTree && book.categoryTree.length
              ? <div className={styles.categoryTree}>
                  {book.categoryTree
                    .map(category => category.name)
                    .join(" | ")}
                </div>
              : null
            }

            <h1>{book.title} {book.subtitle ? `— ${book.subtitle}` : ""}</h1>
            {book.authors.length &&
              <span>by {book.authors.map(author => author.name).join(", ")}</span>}

            <p>{book.description ? book.description : "[Empty Description]"}</p>
          </Expand>

          <div className={styles.spacing}></div>

          <div className={styles.metadata}>
            <ul className={styles.column}>
              <li className={styles.property}>
                <b id="isbn-label">ISBN:</b>
                <span aria-labelledby="isbn-label"> {isbn}</span>
              </li>

              {book.edition &&
                <li className={styles.property}>
                  <b id="edition-label">Edition:</b>
                  <span aria-labelledby="edition-label"> {book.edition}</span>
                </li>
              }

              {book.publisher &&
                <li className={styles.property}>
                  <b id="publisher-label">Publisher:</b>
                  <span aria-labelledby="publisher-label"> {book.publisher.displayName}</span>
                </li>
              }
            </ul>
            <ul className={styles.column}>
              {book.language &&
                <li className={styles.property}>
                  <b id="language-label">Language:</b>
                  <span aria-labelledby="language-label"> {book.language.name} ({book.language.isoCode})</span>
                </li>
              }


              <li className={styles.property}>
                <b id="pages-label">Number of pages:</b>
                <span aria-labelledby="pages-label"> {book.numberOfPages}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {open && isAuthenticated && availableItem && (
        <ReserveModal
          item={availableItem}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Caso o usuário também não estiver autenticado, desabilitar botões */}

    </div>
  );
}
