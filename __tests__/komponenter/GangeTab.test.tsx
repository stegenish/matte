/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GangeTab } from "@/app/oppgaver/GangeTab";

describe("GangeTab", () => {
  it("viser gangetabellen og kan skjule og vise den igjen", async () => {
    const user = userEvent.setup();
    render(<GangeTab leggTilPoeng={jest.fn()} />);

    let tabell = screen.getByRole("table", { name: "Gangetabell" });
    expect(tabell).toBeInTheDocument();
    expect(within(tabell).getAllByText("56")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Skjul gangetabell" }));

    expect(screen.queryByRole("table", { name: "Gangetabell" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Vis gangetabell" }));

    tabell = screen.getByRole("table", { name: "Gangetabell" });
    expect(tabell).toBeInTheDocument();
    expect(within(tabell).getAllByText("56")).toHaveLength(2);
  });
});
