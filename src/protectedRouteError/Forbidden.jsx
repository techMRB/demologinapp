import AccessError from "./AccessError";
const Forbidden = () => <AccessError type={403} />;
export default Forbidden;
