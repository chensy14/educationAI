param(
    [string]$OutputDir = ".\Deliverables\concept_ppt_samples"
)

$ErrorActionPreference = "Stop"

function Set-TextStyle {
    param(
        $TextRange,
        [int]$FontSize = 20,
        [string]$FontName = "Malgun Gothic",
        [int]$Rgb = 0x1F2937,
        [int]$Bold = 0
    )

    $TextRange.Font.Name = $FontName
    $TextRange.Font.Size = $FontSize
    $TextRange.Font.Bold = $Bold
    $TextRange.Font.Color.RGB = $Rgb
}

function Add-Background {
    param($Slide, [int]$Rgb)
    $Slide.FollowMasterBackground = $false
    $Slide.Background.Fill.Solid()
    $Slide.Background.Fill.ForeColor.RGB = $Rgb
}

function Add-Header {
    param($Slide, [string]$Title, [string]$Subtitle)

    Add-Background -Slide $Slide -Rgb 0xF8FAFC

    $band = $Slide.Shapes.AddShape(1, 0, 0, 960, 88)
    $band.Fill.ForeColor.RGB = 0x1D4ED8
    $band.Line.Visible = 0

    $titleBox = $Slide.Shapes.AddTextbox(1, 36, 18, 780, 34)
    $titleRange = $titleBox.TextFrame.TextRange
    $titleRange.Text = $Title
    Set-TextStyle -TextRange $titleRange -FontSize 26 -Rgb 0xFFFFFF -Bold -1

    $subtitleBox = $Slide.Shapes.AddTextbox(1, 36, 98, 860, 24)
    $subtitleRange = $subtitleBox.TextFrame.TextRange
    $subtitleRange.Text = $Subtitle
    Set-TextStyle -TextRange $subtitleRange -FontSize 15 -Rgb 0x475569
}

function Add-Panel {
    param(
        $Slide,
        [string]$Heading,
        [string[]]$Bullets,
        [float]$Left,
        [float]$Top,
        [float]$Width,
        [float]$Height,
        [int]$FillRgb = 0xFFFFFF,
        [int]$HeadingRgb = 0x1D4ED8
    )

    $panel = $Slide.Shapes.AddShape(1, $Left, $Top, $Width, $Height)
    $panel.Fill.ForeColor.RGB = $FillRgb
    $panel.Line.ForeColor.RGB = 0xD7E3F4

    $head = $Slide.Shapes.AddTextbox(1, $Left + 18, $Top + 14, $Width - 36, 26)
    $headRange = $head.TextFrame.TextRange
    $headRange.Text = $Heading
    Set-TextStyle -TextRange $headRange -FontSize 18 -Rgb $HeadingRgb -Bold -1

    $body = $Slide.Shapes.AddTextbox(1, $Left + 18, $Top + 48, $Width - 36, $Height - 62)
    $body.TextFrame.WordWrap = -1
    $range = $body.TextFrame.TextRange
    $range.Text = [string]::Join("`r", ($Bullets | ForEach-Object { "• $_" }))
    Set-TextStyle -TextRange $range -FontSize 18 -Rgb 0x1F2937
    $range.ParagraphFormat.Bullet.Visible = 0
    $range.ParagraphFormat.SpaceAfter = 7
}

function Add-RuleCard {
    param(
        $Slide,
        [string]$Title,
        [string]$Body,
        [float]$Left,
        [float]$Top,
        [int]$AccentRgb
    )

    $card = $Slide.Shapes.AddShape(1, $Left, $Top, 250, 120)
    $card.Fill.ForeColor.RGB = 0xFFFFFF
    $card.Line.ForeColor.RGB = 0xD7E3F4

    $bar = $Slide.Shapes.AddShape(1, $Left, $Top, 250, 10)
    $bar.Fill.ForeColor.RGB = $AccentRgb
    $bar.Line.Visible = 0

    $titleBox = $Slide.Shapes.AddTextbox(1, $Left + 16, $Top + 22, 218, 24)
    $titleRange = $titleBox.TextFrame.TextRange
    $titleRange.Text = $Title
    Set-TextStyle -TextRange $titleRange -FontSize 18 -Rgb 0x1D4ED8 -Bold -1

    $bodyBox = $Slide.Shapes.AddTextbox(1, $Left + 16, $Top + 50, 218, 54)
    $bodyRange = $bodyBox.TextFrame.TextRange
    $bodyRange.Text = $Body
    Set-TextStyle -TextRange $bodyRange -FontSize 16 -Rgb 0x334155
}

function Add-GridDiagram {
    param(
        $Slide,
        [float]$Left,
        [float]$Top,
        [float]$CellSize = 42
    )

    for ($row = 0; $row -le 4; $row++) {
        for ($col = 0; $col -le 4; $col++) {
            $box = $Slide.Shapes.AddShape(1, $Left + ($col * $CellSize), $Top + ($row * $CellSize), $CellSize, $CellSize)
            $box.Fill.Visible = 0
            $box.Line.ForeColor.RGB = 0x94A3B8
            $box.Line.Weight = 1.2
        }
    }

    for ($i = 0; $i -lt 5; $i++) {
        $xlabel = $Slide.Shapes.AddTextbox(1, $Left + ($i * $CellSize) + 12, $Top + 212, 20, 18)
        $xrange = $xlabel.TextFrame.TextRange
        $xrange.Text = "$($i + 1)"
        Set-TextStyle -TextRange $xrange -FontSize 13 -Rgb 0x475569

        $ylabel = $Slide.Shapes.AddTextbox(1, $Left - 18, $Top + (4 - $i) * $CellSize + 10, 16, 18)
        $yrange = $ylabel.TextFrame.TextRange
        $yrange.Text = "$($i + 1)"
        Set-TextStyle -TextRange $yrange -FontSize 13 -Rgb 0x475569
    }

    $startX = $Left + (1 * $CellSize) + 9
    $startY = $Top + (2 * $CellSize) + 9
    $start = $Slide.Shapes.AddShape(9, $startX, $startY, 24, 24)
    $start.Fill.ForeColor.RGB = 0xF97316
    $start.Line.Visible = 0

    $startLabel = $Slide.Shapes.AddTextbox(1, $startX - 2, $startY - 28, 70, 20)
    $startRange = $startLabel.TextFrame.TextRange
    $startRange.Text = "시작점 (2,3)"
    Set-TextStyle -TextRange $startRange -FontSize 14 -Rgb 0xC2410C -Bold -1

    $arrow1 = $Slide.Shapes.AddShape(33, $Left + 92, $Top + 95, 84, 16)
    $arrow1.Fill.ForeColor.RGB = 0x1D4ED8
    $arrow1.Line.Visible = 0
    $label1 = $Slide.Shapes.AddTextbox(1, $Left + 104, $Top + 72, 72, 18)
    $range1 = $label1.TextFrame.TextRange
    $range1.Text = "오른쪽 2칸"
    Set-TextStyle -TextRange $range1 -FontSize 13 -Rgb 0x1D4ED8 -Bold -1

    $arrow2 = $Slide.Shapes.AddShape(33, $Left + 176, $Top + 78, 16, 84)
    $arrow2.Rotation = 270
    $arrow2.Fill.ForeColor.RGB = 0x059669
    $arrow2.Line.Visible = 0
    $label2 = $Slide.Shapes.AddTextbox(1, $Left + 200, $Top + 104, 54, 18)
    $range2 = $label2.TextFrame.TextRange
    $range2.Text = "위로 1칸"
    Set-TextStyle -TextRange $range2 -FontSize 13 -Rgb 0x059669 -Bold -1

    $endX = $Left + (3 * $CellSize) + 9
    $endY = $Top + (1 * $CellSize) + 9
    $end = $Slide.Shapes.AddShape(9, $endX, $endY, 24, 24)
    $end.Fill.ForeColor.RGB = 0x0F766E
    $end.Line.Visible = 0

    $endLabel = $Slide.Shapes.AddTextbox(1, $endX + 20, $endY - 22, 84, 18)
    $endRange = $endLabel.TextFrame.TextRange
    $endRange.Text = "도착점 (4,4)"
    Set-TextStyle -TextRange $endRange -FontSize 14 -Rgb 0x0F766E -Bold -1
}

function Add-FooterTag {
    param($Slide, [string]$Text)

    $tag = $Slide.Shapes.AddShape(1, 700, 18, 220, 26)
    $tag.Fill.ForeColor.RGB = 0xDBEAFE
    $tag.Line.Visible = 0

    $tagBox = $Slide.Shapes.AddTextbox(1, 712, 22, 196, 18)
    $tagRange = $tagBox.TextFrame.TextRange
    $tagRange.Text = $Text
    Set-TextStyle -TextRange $tagRange -FontSize 11 -Rgb 0x1D4ED8 -Bold -1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$pptPath = Join-Path $OutputDir "grade4_math_point_movement_concept.pptx"
$pdfPath = Join-Path $OutputDir "grade4_math_point_movement_concept.pdf"

$powerPoint = New-Object -ComObject PowerPoint.Application
$powerPoint.Visible = -1

try {
    $presentation = $powerPoint.Presentations.Add()

    $s1 = $presentation.Slides.Add(1, 12)
    Add-Header -Slide $s1 -Title "평면에서 점의 이동" -Subtitle "초등학교 4학년 수학 개념 학습 자료"
    Add-FooterTag -Slide $s1 -Text "에듀넷 공개 연수자료의 성취기준 설명 참고"
    Add-Panel -Slide $s1 -Heading "오늘 배울 내용" -Bullets @(
        "점의 위치를 읽고 말해 보기",
        "방향과 몇 칸 이동했는지 설명하기",
        "이동한 뒤의 위치를 찾아보기"
    ) -Left 42 -Top 160 -Width 360 -Height 220 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s1 -Heading "오늘의 핵심" -Bullets @(
        "점은 격자 위에서 움직인다.",
        "방향은 위, 아래, 오른쪽, 왼쪽으로 말한다.",
        "몇 칸 이동했는지 함께 말해야 정확하다."
    ) -Left 430 -Top 160 -Width 480 -Height 220 -FillRgb 0xEFF6FF -HeadingRgb 0x0F766E

    $s2 = $presentation.Slides.Add(2, 12)
    Add-Header -Slide $s2 -Title "무엇을 할 수 있어야 할까?" -Subtitle "[4 수 03-05]의 핵심을 쉬운 말로 바꾼 정리"
    Add-FooterTag -Slide $s2 -Text "공개 성취기준: 위치와 방향을 이용하여 설명"
    Add-RuleCard -Slide $s2 -Title "1. 위치 읽기" -Body "점이 어느 칸에 있는지 먼저 찾는다." -Left 40 -Top 160 -AccentRgb 0xF59E0B
    Add-RuleCard -Slide $s2 -Title "2. 방향 말하기" -Body "위, 아래, 오른쪽, 왼쪽 중 하나를 고른다." -Left 315 -Top 160 -AccentRgb 0x22C55E
    Add-RuleCard -Slide $s2 -Title "3. 몇 칸인지 말하기" -Body "얼마나 움직였는지 칸 수를 함께 말한다." -Left 590 -Top 160 -AccentRgb 0x3B82F6
    Add-Panel -Slide $s2 -Heading "중요한 약속" -Bullets @(
        "점 하나의 이동을 설명하는 데 집중한다.",
        "도형 전체를 움직이는 내용은 오늘 다루지 않는다.",
        "방향과 칸 수를 함께 말해야 위치를 정확히 알 수 있다."
    ) -Left 80 -Top 320 -Width 800 -Height 170 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8

    $s3 = $presentation.Slides.Add(3, 12)
    Add-Header -Slide $s3 -Title "격자에서 점의 이동을 읽는 방법" -Subtitle "방향과 칸 수를 함께 보면 더 쉬워진다"
    Add-Panel -Slide $s3 -Heading "이렇게 읽어요" -Bullets @(
        "오른쪽과 왼쪽은 가로로 움직인다.",
        "위와 아래는 세로로 움직인다.",
        "시작 칸은 세지 않고 움직인 칸만 센다.",
        "도착한 곳의 위치를 마지막에 확인한다."
    ) -Left 40 -Top 155 -Width 330 -Height 300 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-GridDiagram -Slide $s3 -Left 455 -Top 170 -CellSize 42

    $tip = $s3.Shapes.AddTextbox(1, 430, 395, 420, 60)
    $tipRange = $tip.TextFrame.TextRange
    $tipRange.Text = "예: 시작점 (2,3)에서 오른쪽으로 2칸, 위로 1칸 이동하면 도착점은 (4,4)입니다."
    Set-TextStyle -TextRange $tipRange -FontSize 16 -Rgb 0x334155 -Bold 0

    $s4 = $presentation.Slides.Add(4, 12)
    Add-Header -Slide $s4 -Title "개념 설명" -Subtitle "한 점의 이동을 말로 설명해 보자"
    Add-Panel -Slide $s4 -Heading "개념 문장" -Bullets @(
        "점이 어디에서 시작하는지 말한다.",
        "어느 방향으로 이동했는지 말한다.",
        "몇 칸 이동했는지 말한다.",
        "이동 후 어디에 도착했는지 확인한다."
    ) -Left 45 -Top 155 -Width 390 -Height 280 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s4 -Heading "학생이 자주 헷갈리는 점" -Bullets @(
        "오른쪽인데 위로 이동했다고 말하는 경우",
        "시작 칸을 포함해서 칸 수를 세는 경우",
        "도착 위치를 말하지 않고 과정만 말하는 경우"
    ) -Left 465 -Top 155 -Width 430 -Height 280 -FillRgb 0xFEF3C7 -HeadingRgb 0xB45309

    $s5 = $presentation.Slides.Add(5, 12)
    Add-Header -Slide $s5 -Title "같이 해보기" -Subtitle "예를 보고 이동을 차근차근 설명해 보자"
    Add-Panel -Slide $s5 -Heading "상황" -Bullets @(
        "점 A는 (3,2)에 있다.",
        "점 A가 위로 2칸 이동한다.",
        "그다음 왼쪽으로 1칸 이동한다."
    ) -Left 45 -Top 155 -Width 330 -Height 220 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s5 -Heading "설명하기" -Bullets @(
        "먼저 위로 2칸 가면 (3,4)이다.",
        "그다음 왼쪽으로 1칸 가면 (2,4)이다.",
        "최종 위치는 (2,4)이다."
    ) -Left 405 -Top 155 -Width 270 -Height 220 -FillRgb 0xECFDF5 -HeadingRgb 0x047857
    Add-Panel -Slide $s5 -Heading "말할 때 기억할 점" -Bullets @(
        "한 번에 하나씩 이동을 나누어 말한다.",
        "방향과 칸 수를 빠뜨리지 않는다.",
        "마지막 위치를 꼭 말한다."
    ) -Left 705 -Top 155 -Width 210 -Height 220 -FillRgb 0xEFF6FF -HeadingRgb 0x1D4ED8

    $s6 = $presentation.Slides.Add(6, 12)
    Add-Header -Slide $s6 -Title "스스로 해보기" -Subtitle "개념 확인용 짧은 활동"
    Add-Panel -Slide $s6 -Heading "활동 1" -Bullets @(
        "점 B가 (2,4)에 있다.",
        "오른쪽으로 3칸 이동하면 어디일까?"
    ) -Left 45 -Top 160 -Width 270 -Height 160 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s6 -Heading "활동 2" -Bullets @(
        "점 C가 (5,3)에 있다.",
        "아래로 2칸 이동하면 어디일까?"
    ) -Left 345 -Top 160 -Width 270 -Height 160 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s6 -Heading "활동 3" -Bullets @(
        "점 D가 (4,2)에서 (1,2)로 이동했다.",
        "어느 방향으로 몇 칸 움직였을까?"
    ) -Left 645 -Top 160 -Width 270 -Height 160 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s6 -Heading "교사용 정답" -Bullets @(
        "활동 1: (5,4)",
        "활동 2: (5,1)",
        "활동 3: 왼쪽으로 3칸"
    ) -Left 180 -Top 350 -Width 600 -Height 120 -FillRgb 0xFEFCE8 -HeadingRgb 0xA16207

    $s7 = $presentation.Slides.Add(7, 12)
    Add-Header -Slide $s7 -Title "정리하기" -Subtitle "오늘 배운 것을 다시 확인해 보자"
    Add-Panel -Slide $s7 -Heading "오늘의 정리" -Bullets @(
        "점의 이동은 위치, 방향, 칸 수로 설명한다.",
        "오른쪽과 왼쪽은 가로 이동이다.",
        "위와 아래는 세로 이동이다.",
        "도착한 위치를 마지막에 확인한다."
    ) -Left 42 -Top 155 -Width 400 -Height 290 -FillRgb 0xFFFFFF -HeadingRgb 0x1D4ED8
    Add-Panel -Slide $s7 -Heading "마지막 체크" -Bullets @(
        "방향을 정확히 말했나요?",
        "몇 칸 이동했는지 정확히 셌나요?",
        "시작점과 도착점을 구분했나요?"
    ) -Left 470 -Top 155 -Width 420 -Height 290 -FillRgb 0xEFF6FF -HeadingRgb 0x0F766E

    $presentation.SaveAs($pptPath)
    $presentation.SaveAs($pdfPath, 32)
    $presentation.Close()
}
finally {
    if ($powerPoint) {
        $powerPoint.Quit()
    }
}

Get-ChildItem $OutputDir | Select-Object Name, Length | Sort-Object Name

