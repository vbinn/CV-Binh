using System;
using System.IO;
public static class ChillPiano {
  public static void Create(string path) {
    const int rate=22050;
    const int seconds=64;
    double[] mix=new double[rate*seconds];
    // 60 BPM, hợp âm Cmaj7 – Am7 – Fmaj7 – G6, hai vòng biến tấu.
    int[][] chords={new[]{48,55,59,64},new[]{45,52,55,60},new[]{41,48,52,57},new[]{43,50,55,59}};
    int[] melody={76,74,71,72, 72,71,67,69, 69,67,64,67, 71,69,67,74};
    for(int bar=0;bar<16;bar++) {
      int[] chord=chords[bar%4];
      Note(mix,rate,bar*4, chord[0]-12, .14, 4.0);
      for(int j=0;j<4;j++) Note(mix,rate,bar*4+j*.8, chord[j]+12, .13, 3.5);
      if(bar%2==0) {
        Note(mix,rate,bar*4+.5,melody[bar],.085,3.7);
        Note(mix,rate,bar*4+2.5,melody[(bar+1)%16],.065,3.4);
      }
    }
    // Réverbération discrète, enveloppée sur la boucle pour une reprise douce.
    double[] wet=(double[])mix.Clone();
    for(int tap=1;tap<=4;tap++) {
      int delay=(int)(rate*(.19*tap));
      double gain=.13*Math.Pow(.55,tap-1);
      for(int i=0;i<mix.Length;i++) wet[(i+delay)%mix.Length]+=mix[i]*gain;
    }
    double peak=.001;
    foreach(double sample in wet) peak=Math.Max(peak,Math.Abs(sample));
    using(var writer=new BinaryWriter(File.Create(path))) {
      writer.Write(System.Text.Encoding.ASCII.GetBytes("RIFF")); writer.Write(36+wet.Length*2);
      writer.Write(System.Text.Encoding.ASCII.GetBytes("WAVEfmt ")); writer.Write(16);
      writer.Write((short)1);writer.Write((short)1);writer.Write(rate);writer.Write(rate*2);
      writer.Write((short)2);writer.Write((short)16);
      writer.Write(System.Text.Encoding.ASCII.GetBytes("data"));writer.Write(wet.Length*2);
      foreach(double sample in wet) writer.Write((short)(sample/peak*23000));
    }
  }
  static void Note(double[] mix,int rate,double start,int midi,double volume,double duration) {
    double freq=440*Math.Pow(2,(midi-69)/12.0);
    for(int i=0;i<(int)(duration*rate);i++) {
      double t=(double)i/rate;
      double attack=1-Math.Exp(-t/0.025);
      double release=Math.Min(1,(duration-t)/.5);
      double tone=Math.Sin(2*Math.PI*freq*t)*Math.Exp(-t/1.65)
        +.16*Math.Sin(2*Math.PI*freq*2.001*t)*Math.Exp(-t/.85)
        +.035*Math.Sin(2*Math.PI*freq*3*t)*Math.Exp(-t/.45);
      int index=((int)(start*rate)+i)%mix.Length;
      mix[index]+=tone*attack*release*volume;
    }
  }
}
