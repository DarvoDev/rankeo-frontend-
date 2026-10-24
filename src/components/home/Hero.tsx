import { useState, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEMO_CODE } from '../../lib/demo';
import { roomService } from '../../room/roomService';
import { useToast } from '../ui/toastContext';
import { DecoCards } from './DecoCards';
import styles from './Hero.module.css';

interface Props {
  inputRef: RefObject<HTMLInputElement | null>;
  onJoin: () => void;
}

export function Hero({ inputRef, onJoin }: Props) {
  const navigate = useNavigate();
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  // El apodo se pide al entrar a la sala, así la portada queda limpia
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const room = await roomService.create(inputRef.current?.value.trim() ?? '');
      navigate(`/sala/${room.code}`, { state: { created: true } });
    } catch {
      toast('No se pudo crear la sala.');
      setCreating(false);
    }
  }

  return (
    <main className={styles.hero}>
      <DecoCards />

      <Link className={styles.badge} to={`/sala/${DEMO_CODE}`}>
        <span className={styles.live} /> Ahora con salas en tiempo real <span className={styles.arrow}>↗</span>
      </Link>

      <h1>Tu espacio para<br /><em>rankear</em> todo.</h1>

      <p className={styles.sub}>
        Más que una lista: un lienzo colaborativo para rankear, compartir y descubrir
        lo que importa, con tus amigos, en minutos.
      </p>

      <form className={styles.createPill} onSubmit={create}>
        <input
          ref={inputRef}
          type="text"
          maxLength={80}
          placeholder="Ponle nombre a tu tier list"
          aria-label="Nombre de la tier list"
        />
        <button type="submit" className="pill-white" disabled={creating}>
          {creating ? 'Creando…' : 'Crear'}
        </button>
      </form>

      <p className={styles.alt}>
        ¿Te invitaron? <button type="button" onClick={onJoin}>Únete con un código</button>
      </p>
    </main>
  );
}
