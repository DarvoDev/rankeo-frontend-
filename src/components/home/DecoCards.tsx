import styles from './DecoCards.module.css';

/** Tarjetas decorativas que flotan en las esquinas de la portada */
export function DecoCards() {
  return (
    <div aria-hidden="true">
      <div className={`${styles.deco} ${styles.d1}`}>
        <div className={styles.img} />
        <div className={styles.bar} />
        <div className={styles.bar} style={{ width: '60%' }} />
      </div>

      <div className={`${styles.deco} ${styles.d2}`}>
        <div className={styles.img}>🏆</div>
        <div className={styles.bar} style={{ width: '80%' }} />
      </div>

      <div className={`${styles.deco} ${styles.d3}`}>
        <div className={styles.blobs}>
          <span style={{ background: 'linear-gradient(135deg,#7fc4e0,#5a8fc4)' }} />
          <span style={{ background: 'linear-gradient(135deg,#c9a6e8,#8f6cc4)' }} />
        </div>
        <div className={styles.bar} />
        <div className={styles.bar} style={{ width: '55%' }} />
      </div>

      <div className={`${styles.deco} ${styles.d4}`}>
        <MiniRow letter="S" color="#c96063" squares={['#dba06d', '#e39ab8']} />
        <MiniRow letter="A" color="#dba06d" squares={['#74bdd6', '#a98ad6', '#6fc29c']} />
        <MiniRow letter="B" color="#c9a640" squares={['#e39ab8']} />
        <span className={styles.liveTag}>3 amigos rankeando</span>
      </div>
    </div>
  );
}

function MiniRow({ letter, color, squares }: { letter: string; color: string; squares: string[] }) {
  return (
    <div className={styles.row}>
      <span className={styles.letter} style={{ background: color }}>{letter}</span>
      {squares.map((c, i) => <span key={i} className={styles.sq} style={{ background: c }} />)}
    </div>
  );
}
