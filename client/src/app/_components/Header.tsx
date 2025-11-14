import Link from "next/link";
import styles from "./Header.module.css";
import Image from "next/image";

export function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/images/bookhub_icon.png" 
            alt="BookHub" 
            width={40} 
            height={40}
            className={styles.logo}
            priority
          />
          <span>BookHub</span>
        </Link>
        <nav>
          <Link href="/register" className={styles.registerLink}>Cadastro</Link>
          <button className={styles.loginButton}>
            <Link className={styles.loginButtonLink} href="/login">Login</Link>
          </button>
        </nav>
      </div>
    </div>
  );
}
