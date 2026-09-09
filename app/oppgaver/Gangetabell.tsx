const GANGERIADER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function Gangetabell() {
  return (
    <div className="shrink-0 overflow-auto">
      <h2 className="text-lg font-black text-gray-600 mb-2 text-center">
        Gangetabell
      </h2>
      <table
        aria-label="Gangetabell"
        className="border-collapse text-center text-base font-bold"
      >
        <thead>
          <tr>
            <th className="w-12 h-12 bg-purple-100 text-purple-700 border border-purple-200">
              ×
            </th>
            {GANGERIADER.map((n) => (
              <th
                key={n}
                className="w-12 h-12 bg-purple-100 text-purple-700 border border-purple-200"
              >
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GANGERIADER.map((a) => (
            <tr key={a}>
              <th className="w-12 h-12 bg-purple-100 text-purple-700 border border-purple-200">
                {a}
              </th>
              {GANGERIADER.map((b) => {
                const mørkRad = a % 2 === 0;
                const mørkKol = b % 2 === 0;
                const bakgrunn =
                  mørkRad && mørkKol
                    ? "bg-yellow-100"
                    : mørkRad || mørkKol
                      ? "bg-yellow-50"
                      : "bg-white";
                return (
                  <td
                    key={b}
                    className={`w-12 h-12 border border-yellow-200 text-gray-700 hover:bg-orange-100 ${bakgrunn}`}
                  >
                    {a * b}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
