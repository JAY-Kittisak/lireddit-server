import DataLoader from "dataloader";
import { In } from "typeorm";
import { SalesIssue, VisitIssue } from "../entities"

const batchIssues = async (visitIds: number[]) => {
    const issueVisits = await VisitIssue.find({
        join: {
            alias: "visitIssue",
            innerJoinAndSelect: {
                issue: "visitIssue.issue"
            }
        },
        where: {
            visitId: In(visitIds)
        }

    });

    const visitIdToIssues: { [key: number]: SalesIssue[] } = {};

    issueVisits.forEach(vi => {
        if (vi.visitId in visitIdToIssues) {
            visitIdToIssues[vi.visitId].push((vi as any).__issue__)
        } else {
            visitIdToIssues[vi.visitId] = [(vi as any).__issue__]
        }
    })

    return visitIds.map(visitId => visitIdToIssues[visitId])
}


export const createIssuesLoader = () => new DataLoader(batchIssues)