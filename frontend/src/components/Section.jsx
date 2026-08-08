import { cls } from '../utils/helpers';

export default function Section({ id, className, children }) {
  return (
    <section id={id} className={cls('py-14 sm:py-20', className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}