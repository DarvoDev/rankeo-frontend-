import { Link } from 'react-router-dom';
import { Modal } from '../ui/Modal';

export function RoomNotFound({ code }: { code: string }) {
  return (
    <Modal title="Sala no encontrada">
      <p>{code ? `No existe ninguna sala con el código ${code}.` : 'Falta el código de la sala en el enlace.'}</p>
      <Link className="btn btn-primary" to="/" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </Modal>
  );
}
