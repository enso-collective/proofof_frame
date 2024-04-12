import { Button } from "frog";
export const errorScreen = (text?: string) => ({
  image: (
    <div
      style={{
        alignItems: "center",
        background: "black",
        backgroundSize: "100% 100%",
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        height: "100%",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 40,
          fontStyle: "normal",
          letterSpacing: "-0.025em",
          lineHeight: 1.4,
          marginTop: 30,
          padding: "0 120px",
          whiteSpace: "pre-wrap",
        }}
      >
        {text || "Something went wrong"}
      </div>
    </div>
  ),
  intents: [<Button.Reset>Reset</Button.Reset>],
});

export const infoScreen = (text: string, buttons: any[]) => ({
  image: (
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(to right, #432889, #17101F)",
        backgroundSize: "100% 100%",
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
        height: "100%",
        justifyContent: "center",
        textAlign: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 25,
          fontStyle: "normal",
          letterSpacing: "-0.025em",
          lineHeight: 1.4,
          marginTop: 20,
          padding: "0 120px",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    </div>
  ),
  intents: buttons,
});
