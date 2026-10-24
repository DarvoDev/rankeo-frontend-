import styles from './HowItWorks.module.css';

const STEPS = [
  { color: '#f0609e', title: 'Crea una sala', text: 'Ponle nombre a tu tier list y obtén al instante un código de 6 letras.' },
  { color: '#f58f5c', title: 'Invita a tu grupo', text: 'Comparte el código o el enlace. Tus amigos entran solo con un apodo.' },
  { color: '#f7c548', title: 'Rankeen en vivo', text: 'Suban imágenes, arrástrenlas de S a D y vean cada movimiento al momento.' },
];

const MINI_TIERS: [letter: string, color: string, slots: number][] = [
  ['S', '#c96063', 3], ['A', '#dba06d', 2], ['B', '#dcc86c', 4],
];

export function HowItWorks() {
  return (
    <section className={styles.how} id="como-funciona">
      <h2>Cómo funciona</h2>
      <p className={styles.sub}>De la idea a la tier list terminada, sin cuentas ni instalaciones.</p>
      <div className={styles.grid}>
        {STEPS.map((step, i) => (
          <article key={step.title} className={styles.card}>
            <span className={styles.num} style={{ background: step.color }}>{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            {i === STEPS.length - 1 && (
              <div className={styles.mini} aria-hidden="true">
                {MINI_TIERS.map(([letter, color, slots]) => (
                  <div key={letter}>
                    <b style={{ background: color }}>{letter}</b>
                    {Array.from({ length: slots }, (_, n) => <i key={n} />)}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
