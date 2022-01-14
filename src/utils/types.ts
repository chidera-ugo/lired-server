import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { Request, Response } from "express"

export interface Context {
	em: EntityManager<IDatabaseDriver<Connection>>
	res: Response
	req: Request
}
