import type { AssessmentIdea } from "./types";

export const ASSESSMENT_IDEAS: AssessmentIdea[] = [
  {
    id: "ass-hb-pass-1",
    code: "ASS.HB.P1",
    description: "Observe passing accuracy in 3v3 handball — target 8/10 successful passes.",
    topicIds: ["handball"],
    skillIds: ["passing"],
  },
  {
    id: "ass-hb-pass-2",
    code: "ASS.HB.P2",
    description: "Peer assess receiving body position before passing in handball.",
    topicIds: ["handball"],
    skillIds: ["passing", "receiving"],
  },
  {
    id: "ass-fb-kick-1",
    code: "ASS.FB.K1",
    description: "Record kicking accuracy to targets from 10m in football.",
    topicIds: ["football"],
    skillIds: ["kicking"],
  },
  {
    id: "ass-fb-finish-1",
    code: "ASS.FB.F1",
    description: "Count goals scored from crossing situations in football.",
    topicIds: ["football"],
    skillIds: ["finishing"],
  },
  {
    id: "ass-bb-pass-1",
    code: "ASS.BB.P1",
    description: "Assess chest and bounce pass technique in basketball drills.",
    topicIds: ["basketball"],
    skillIds: ["passing"],
  },
  {
    id: "ass-ath-run-1",
    code: "ASS.AT.R1",
    description: "Time sprint over 60m and compare to personal best in athletics.",
    topicIds: ["athletics"],
    skillIds: ["running"],
  },
  {
    id: "ass-fit-end-1",
    code: "ASS.FT.E1",
    description: "Monitor heart rate during 12-minute endurance activity.",
    topicIds: ["fitness"],
    skillIds: ["endurance"],
  },
];
