import DataLoader from "dataloader";
import { In } from "typeorm";
import { SalesVisit, VisitIssue } from "../entities"

const batchSalesVisits = async (issuesIds: number[]) => {
    const visitIssues = await VisitIssue.find({
        join: {
            alias: "visitIssue",
            innerJoinAndSelect: {
                visit: "visitIssue.visit"
            }
        },
        where: {
            issueId: In(issuesIds)
        }
    });

    const issueIdToVisits: { [key: number]: SalesVisit[] } = {};

    visitIssues.forEach(vi => {
        if (vi.issueId in issueIdToVisits) {
            issueIdToVisits[vi.issueId].push((vi as any).__visit__);
        } else {
            issueIdToVisits[vi.issueId] = [(vi as any).__visit__];
        }
    });

    return issuesIds.map(issueId => issueIdToVisits[issueId])
};

export const createVisitsLoader = () => new DataLoader(batchSalesVisits);