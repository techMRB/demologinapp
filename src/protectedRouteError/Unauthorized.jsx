import AccessError from "./AccessError";
const Unauthorized = () => <AccessError type={401} />;
export default Unauthorized;
