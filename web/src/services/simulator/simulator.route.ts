import { baseUrl } from "../index.route";

const SimulatorRoute = {
  send: (slug: string) => `${baseUrl}/simulator/payers/${slug}/send`,
};

export default SimulatorRoute;
