import {
  E_MAType,
  IndicatorImplementation,
  TDrawStyle,
  TIndexBuffer,
  TOptionType,
  TOptValue_number,
  TOptValue_str,
  TOutputWindow,
  TPenStyle,
  TPriceType,
} from 'forex-tester-custom-indicator-api';

export default class MovingAverage extends IndicatorImplementation {
  // parameters
  public Period!: TOptValue_number;
  public Shift!: TOptValue_number;
  public MAtype!: TOptValue_number;
  public ApplyToPrice!: TOptValue_number;
  public VShift!: TOptValue_number;
  public ColorAbove!: TOptValue_str;
  public ColorBelow!: TOptValue_str;
  // buffers
  public MAAbove!: TIndexBuffer;
  public MABelow!: TIndexBuffer;
  private SMA!: TIndexBuffer;

  public Init(): void {
    this.Period = this.api.createTOptValue_number(8);
    this.Shift = this.api.createTOptValue_number(0);
    this.MAtype = this.api.createTOptValue_number(E_MAType.SMA);
    this.ApplyToPrice = this.api.createTOptValue_number(TPriceType.CLOSE);
    this.VShift = this.api.createTOptValue_number(0);
    this.ColorAbove = this.api.createTOptValue_str('#00FF00');
    this.ColorBelow = this.api.createTOptValue_str('#FF0000');

    this.api.RecalculateMeAlways();
    this.api.IndicatorShortName('Moving Average');
    this.api.SetOutputWindow(TOutputWindow.CHART_WINDOW);
    this.api.SetEmptyValue(0);

    this.api.AddSeparator('Common');

    this.api.RegOption('Period', TOptionType.INTEGER, this.Period);
    this.api.SetOptionRange('Period', 1, Number.MAX_SAFE_INTEGER);

    this.api.RegOption('Horizontal Shift', TOptionType.INTEGER, this.Shift);

    this.api.RegOption('Vertical Shift', TOptionType.INTEGER, this.VShift);

    this.api.RegMATypeOption(this.MAtype, 'MA Type');

    this.api.RegApplyToPriceOption(this.ApplyToPrice, 'Apply to Price');

    this.api.AddSeparator('Colors');

    this.api.RegOption('Color Above MA', TOptionType.COLOR, this.ColorAbove);

    this.api.RegOption('Color Below MA', TOptionType.COLOR, this.ColorBelow);

    this.SMA = this.api.CreateIndexBuffer();
    this.MAAbove = this.api.CreateIndexBuffer();
    this.MABelow = this.api.CreateIndexBuffer();

    this.api.IndicatorBuffers(2);

    this.api.SetIndexBuffer(0, this.MAAbove);
    this.api.SetIndexLabel(0, 'MA Above');
    this.api.SetIndexStyle(
      0,
      TDrawStyle.LINE,
      TPenStyle.SOLID,
      3,
      this.ColorAbove.value
    );
    this.api.SetIndexDrawBegin(0, this.Period.value - 1 + this.Shift.value);

    this.api.SetIndexBuffer(1, this.MABelow);
    this.api.SetIndexLabel(1, 'MA Below');
    this.api.SetIndexStyle(
      1,
      TDrawStyle.LINE,
      TPenStyle.SOLID,
      3,
      this.ColorBelow.value
    );
    this.api.SetIndexDrawBegin(1, this.Period.value - 1 + this.Shift.value);
  }

  public Calculate(index: number): void {
    if (index + this.Period.value >= this.api.Bars()) {
      return;
    }

    const calculatedSMA = this.api.GetMA(
      index,
      0,
      this.Period.value,
      this.MAtype.value,
      this.ApplyToPrice.value,
      this.SMA.getValue(index + 1)
    );

    this.SMA.setValue(index, calculatedSMA);

    const maValue = calculatedSMA + this.VShift.value * this.api.Point();

    // Set value to correct buffer based on close price vs MA
    const closePrice = this.api.Close(index);
    if (closePrice >= maValue) {
      this.MAAbove.setValue(index, maValue);
      this.MABelow.setValue(index, 0); // Empty value
    } else {
      this.MAAbove.setValue(index, 0); // Empty value
      this.MABelow.setValue(index, maValue);
    }
  }

  public OnParamsChange(): void {
    this.api.SetBufferShift(0, this.Shift.value);
    this.api.SetBufferShift(1, this.Shift.value);
  }
}
