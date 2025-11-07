import {
  E_MAType,
  IndicatorImplementation,
  TDrawStyle,
  TIndexBuffer,
  TOptionType,
  TOptValue_number,
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
  // buffers
  public SSMA!: TIndexBuffer;
  private SMA!: TIndexBuffer;

  public Init(): void {
    this.Period = this.api.createTOptValue_number(8);
    this.Shift = this.api.createTOptValue_number(0);
    this.MAtype = this.api.createTOptValue_number(E_MAType.SMA);
    this.ApplyToPrice = this.api.createTOptValue_number(TPriceType.CLOSE);
    this.VShift = this.api.createTOptValue_number(0);

    this.api.RecalculateMeAlways();
    this.api.IndicatorShortName('indicators.movingAverage');
    this.api.SetOutputWindow(TOutputWindow.CHART_WINDOW);
    this.api.SetEmptyValue(0);

    this.api.AddSeparator('Common');

    this.api.RegOption(
      'indicatorModal.general.generalFields.period',
      TOptionType.INTEGER,
      this.Period
    );
    this.api.SetOptionRange(
      'indicatorModal.movingAverage.fields.period',
      1,
      Number.MAX_SAFE_INTEGER
    );

    this.api.RegOption(
      'indicatorModal.movingAverage.fields.hShift',
      TOptionType.INTEGER,
      this.Shift
    );

    this.api.RegOption(
      'indicatorModal.movingAverage.fields.vShift',
      TOptionType.INTEGER,
      this.VShift
    );

    this.api.RegMATypeOption(
      this.MAtype,
      'indicatorModal.movingAverage.fields.maType'
    );

    this.api.RegApplyToPriceOption(
      this.ApplyToPrice,
      'indicatorModal.general.applyToPrice'
    );

    this.SMA = this.api.CreateIndexBuffer();
    this.SSMA = this.api.CreateIndexBuffer();

    this.api.IndicatorBuffers(1);

    this.api.SetIndexBuffer(0, this.SSMA);
    this.api.SetIndexLabel(0, 'indicatorModal.general.generalFields.ma');
    this.api.SetIndexStyle(0, TDrawStyle.LINE, TPenStyle.SOLID, 3, '#00FF00');
    this.api.SetIndexDrawBegin(0, this.Period.value - 1 + this.Shift.value);
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

    this.SSMA.setValue(
      index,
      calculatedSMA + this.VShift.value * this.api.Point()
    );
  }

  public OnParamsChange(): void {
    this.api.SetBufferShift(0, this.Shift.value);
  }
}
